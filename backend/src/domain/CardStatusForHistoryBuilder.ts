import { SetSettings, Card } from '@backend/database/schema/index.js'
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
          setSettings: null,
        })
      }
      return CardStatusForHistory.fromData({
        cardVersion: this.cardVersionsByCardHash[cardHash],
        invoices: this.invoicesByCardHash[cardHash] ?? [],
        lnurlP: this.lnurlPsByCardHash[cardHash] ?? null,
        lnurlW: this.LnurlWsByCardHash[cardHash] ?? null,
        setSettings: this.setSettingsByCardHash[cardHash] ?? null,
      })
    })
  }

  protected setSettingsByCardHash: Record<Card['hash'], SetSettings> = {}

  protected async resolveSetNames(): Promise<void> {
    const setSettingsByCardVersionId = await asTransaction(async (queries) => queries.getSetSettingsForCardVersions(this.cardVersionIds))
    Object.entries(setSettingsByCardVersionId).forEach(([cardVersionId, setSettings]) => {
      const cardVersion = this.cardVersionsById[cardVersionId]
      this.setSettingsByCardHash[cardVersion.card] = setSettings
    })
  }
}
