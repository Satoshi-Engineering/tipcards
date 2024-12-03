import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import { Card, CardVersion, LnurlP, LnurlW } from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

import CardStatus from './CardStatus.js'
import CardStatusCollection from './CardStatusCollection.js'

export const defaultCardVersion = {
  id: '00000000-0000-0000-0000-000000000000',
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: '',
  noteForStatusPage: '',
  sharedFunding: false,
  landingPageViewed: null,
}

export default class CardStatusBuilder {
  public readonly cardHashes: Card['hash'][]

  public constructor(cardHashes: Card['hash'] | Card['hash'][]) {
    if (Array.isArray(cardHashes)) {
      this.cardHashes = cardHashes
    } else {
      this.cardHashes = [cardHashes]
    }
  }

  public async build(): Promise<void> {
    await this.loadCardVersions()
    await this.loadSatoshiMovements()
  }

  public getCardStatus(): CardStatus {
    const cardStatuses = this.cardStatuses
    if (cardStatuses.length !== 1) {
      throw new Error(`CardStatusBuilder.getCardStatus() should only be called when building a single card. Was called for ${this.cardHashes.join(', ')}`)
    }
    return cardStatuses[0]
  }

  public getCardStatusCollection(): CardStatusCollection {
    return new CardStatusCollection(this.cardStatuses)
  }

  protected cardVersionsById: Record<CardVersion['id'], CardVersion> = {}
  protected cardVersionsByCardHash: Record<Card['hash'], CardVersion> = {}
  protected invoicesByCardHash: Record<Card['hash'], InvoiceWithSetFundingInfo[]> = {}
  protected lnurlPsByCardHash: Record<Card['hash'], LnurlP> = {}
  protected LnurlWsByCardHash: Record<Card['hash'], LnurlW> = {}

  protected get cardVersionIds() {
    return Object.keys(this.cardVersionsById)
  }

  protected async loadCardVersions(): Promise<void> {
    const cardVersions: CardVersion[] = await asTransaction(async (queries) => queries.getLatestCardVersions(this.cardHashes))
    cardVersions.forEach((cardVersion) => {
      this.cardVersionsById[cardVersion.id] = cardVersion
      this.cardVersionsByCardHash[cardVersion.card] = cardVersion
    })
  }

  protected async loadSatoshiMovements(): Promise<void> {
    await Promise.all([
      this.loadInvoices(),
      this.loadLnurlP(),
      this.loadLnurlW(),
    ])
  }

  protected async loadInvoices(): Promise<void> {
    const invoicesByCardVersionId = await asTransaction(async (queries) => queries.getAllInvoicesFundingCardVersionsWithSetFundingInfo(this.cardVersionIds))
    Object.entries(invoicesByCardVersionId).forEach(([cardVersionId, invoice]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.invoicesByCardHash[cardVersion.card] = invoice
    })
  }

  protected async loadLnurlP(): Promise<void> {
    const lnurlPs = await asTransaction(async (queries) => queries.getLnurlPsFundingCardVersions(this.cardVersionIds))
    Object.entries(lnurlPs).forEach(([cardVersionId, lnurlP]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.lnurlPsByCardHash[cardVersion.card] = lnurlP
    })
  }

  protected async loadLnurlW(): Promise<void> {
    const lnurlWs = await asTransaction(async (queries) => queries.getLnurlWsWithdrawingCardVersions(this.cardVersionIds))
    Object.entries(lnurlWs).forEach(([cardVersionId, lnurlW]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.LnurlWsByCardHash[cardVersion.card] = lnurlW
    })
  }

  protected get cardStatuses(): CardStatus[] {
    return this.cardHashes.map((cardHash) => {
      if (!this.cardVersionsByCardHash[cardHash]) {
        return CardStatus.fromData({
          cardVersion: { ...defaultCardVersion, card: cardHash },
          invoices: [],
          lnurlP: null,
          lnurlW: null,
        })
      }
      return CardStatus.fromData({
        cardVersion: this.cardVersionsByCardHash[cardHash],
        invoices: this.invoicesByCardHash[cardHash] ?? [],
        lnurlP: this.lnurlPsByCardHash[cardHash] ?? null,
        lnurlW: this.LnurlWsByCardHash[cardHash] ?? null,
      })
    })
  }
}
