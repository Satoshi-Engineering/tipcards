import { Card } from '@backend/database/schema/index.js'
import { isLnbitsWithdrawLinkUsed } from '@backend/services/lnbitsHelpers.js'

import CardStatusBuilder, { defaultCardVersion } from './CardStatusBuilder.js'
import LiveCardStatus from './LiveCardStatus.js'

export default class LiveCardStatusBuilder extends CardStatusBuilder {
  public constructor(cardHash: Card['hash']) {
    super(cardHash)
  }

  public async build(): Promise<void> {
    await super.build()
    await this.resolveWithdrawPending()
  }

  public get cardStatuses(): LiveCardStatus[] {
    return this.cardHashes.map((cardHash) => {
      if (!this.cardVersionsByCardHash[cardHash]) {
        return LiveCardStatus.fromData({
          cardVersion: { ...defaultCardVersion, card: cardHash },
          invoices: [],
          lnurlP: null,
          lnurlW: null,
          withdrawPending: false,
        })
      }
      return LiveCardStatus.fromData({
        cardVersion: this.cardVersionsByCardHash[cardHash],
        invoices: this.invoicesByCardHash[cardHash] ?? [],
        lnurlP: this.lnurlPsByCardHash[cardHash] ?? null,
        lnurlW: this.LnurlWsByCardHash[cardHash] ?? null,
        withdrawPending: this.withdrawPendingByCardHash[cardHash] ?? false,
      })
    })
  }

  protected withdrawPendingByCardHash: Record<Card['hash'], boolean> = {}

  protected async resolveWithdrawPending(): Promise<void> {
    await Promise.all(this.cardHashes.map(async (cardHash) => {
      const lnurlW = this.LnurlWsByCardHash[cardHash]
      if (lnurlW == null || lnurlW.withdrawn != null) {
        return
      }

      this.withdrawPendingByCardHash[cardHash] = await isLnbitsWithdrawLinkUsed(lnurlW.lnbitsId)
    }))
  }
}
