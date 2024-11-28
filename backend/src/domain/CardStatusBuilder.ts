import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import { Card, CardVersion } from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

import CardStatusCollection from './CardStatusCollection.js'
import CardStatus from './CardStatus.js'

const defaultCardVersion = {
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
    await this.loadCardVersion()
    await this.loadSatoshiMovements()
  }

  public getResult(): CardStatus | CardStatusCollection {
    const cardStatuses = this.cardHashes.map((cardHash) => {
      if (!this.cardVersionsByCardHash[cardHash]) {
        return CardStatus.fromData({
          cardVersion: { ...defaultCardVersion, card: cardHash },
        })
      }
      return CardStatus.fromData({
        cardVersion: this.cardVersionsByCardHash[cardHash],
        invoices: this.invoicesByCardHash[cardHash],
      })
    })
    if (cardStatuses.length === 1) {
      return cardStatuses[0]
    }
    return CardStatusCollection.fromCardStatuses(cardStatuses)
  }

  private cardVersionsById: Record<CardVersion['id'], CardVersion> = {}
  private cardVersionsByCardHash: Record<Card['hash'], CardVersion> = {}
  private invoicesByCardHash: Record<Card['hash'], InvoiceWithSetFundingInfo[]> = {}

  private get cardVersionIds() {
    return Object.keys(this.cardVersionsById)
  }

  private async loadCardVersion(): Promise<void> {
    const cardVersions: CardVersion[] = await asTransaction(async (queries) => queries.getLatestCardVersions(this.cardHashes))
    cardVersions.forEach((cardVersion) => {
      this.cardVersionsById[cardVersion.id] = cardVersion
      this.cardVersionsByCardHash[cardVersion.card] = cardVersion
    })
  }

  private async loadSatoshiMovements(): Promise<void> {
    await Promise.all([
      this.loadInvoices(),
    ])
  }

  private async loadInvoices(): Promise<void> {
    const invoicesByCardVersionId = await asTransaction(async (queries) => queries.getAllInvoicesFundingCardVersionsWithSetFundingInfo(this.cardVersionIds))
    Object.entries(invoicesByCardVersionId).forEach(([cardVersionId, invoice]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.invoicesByCardHash[cardVersion.card] = invoice
    })
  }
}
