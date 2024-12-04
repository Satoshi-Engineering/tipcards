import { Card } from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

import CardStatusBuilder, { defaultCardVersion } from './CardStatusBuilder.js'
import CardStatusForHistory from './CardStatusForHistory.js'

export default class CardStatusForHistoryBuilder extends CardStatusBuilder {
  public async build(): Promise<void> {
    await super.build()
    await this.resolveSetNames()
  }

  public get cardStatuses(): CardStatusForHistory[] {
    return this.cardHashes.map((cardHash) => {
      if (!this.cardVersionsByCardHash[cardHash]) {
        return CardStatusForHistory.fromData({
          cardVersion: { ...defaultCardVersion, card: cardHash },
          invoices: [],
          lnurlP: null,
          lnurlW: null,
          setName: null,
        })
      }
      return CardStatusForHistory.fromData({
        cardVersion: this.cardVersionsByCardHash[cardHash],
        invoices: this.invoicesByCardHash[cardHash] ?? [],
        lnurlP: this.lnurlPsByCardHash[cardHash] ?? null,
        lnurlW: this.LnurlWsByCardHash[cardHash] ?? null,
        setName: this.setNamesByCardHash[cardHash] ?? null,
      })
    })
  }

  protected setNamesByCardHash: Record<Card['hash'], string> = {}

  protected async resolveSetNames(): Promise<void> {
    const setNamesByCardVersionId = await asTransaction(async (queries) => queries.getSetNamesForCardVersions(this.cardVersionIds))
    Object.entries(setNamesByCardVersionId).forEach(([cardVersionId, setName]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.setNamesByCardHash[cardVersion.card] = setName
    })
  }
}
