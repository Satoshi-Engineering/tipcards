import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { asTransaction } from '@backend/database/client.js'
import type { LnurlW } from '@backend/database/schema/LnurlW.js'

import CardStatusCollection from './CardStatusCollection.js'
import CardStatus from './CardStatus.js'
import { OpenBulkwithdrawTask } from './OpenBulkWithdrawTask.js'
import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'
import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'

export default class OpenTaskBuilder {
  public readonly cardStatusCollection: CardStatusCollection

  public constructor(cardStatusCollection: CardStatusCollection) {
    this.cardStatusCollection = cardStatusCollection
  }

  public async build(): Promise<void> {
    this.groupCardStatusesByLnurlW()
    await this.loadSetInfoForLnurlWs()
    this.openBulkWithdrawTasks = this.lnurlWs.map((lnurlW) => this.openBulkWithdrawTaskFromLnurlW(lnurlW))
  }

  public get openTasks(): OpenBulkwithdrawTask[] {
    return [...this.openBulkWithdrawTasks]
  }

  private openBulkWithdrawTasks: OpenBulkwithdrawTask[] = []
  private cardStatusesByLnurlW: Record<LnurlW['lnbitsId'], CardStatus[]> = {}
  private lnurlWs: LnurlW[] = []
  private setWithSettingsByLnurlW: Record<LnurlW['lnbitsId'], SetWithSettings> = {}

  private groupCardStatusesByLnurlW(): void {
    this.bulkWithdrawCardStatuses.forEach((cardStatus) => {
      const { lnurlW } = cardStatus
      if (lnurlW == null) {
        return
      }
      this.addCardStatus(lnurlW.lnbitsId, cardStatus)
      this.addLnurlW(lnurlW)
    })
  }

  private addCardStatus(lnbitsId: LnurlW['lnbitsId'], cardStatus: CardStatus): void {
    this.makeSureCardStatusArrayExists(lnbitsId)
    this.cardStatusesByLnurlW[lnbitsId].push(cardStatus)
  }

  private makeSureCardStatusArrayExists(lnbitsId: LnurlW['lnbitsId']): void {
    if (this.cardStatusesByLnurlW[lnbitsId] == null) {
      this.cardStatusesByLnurlW[lnbitsId] = []
    }
  }

  private addLnurlW(lnurlW: LnurlW): void {
    if (this.isNewLnurlW(lnurlW)) {
      this.lnurlWs.push(lnurlW)
    }
  }

  private isNewLnurlW(lnurlW: LnurlW): boolean {
    return this.lnurlWs.find((existingLnurlW) => existingLnurlW.lnbitsId === lnurlW.lnbitsId) == null
  }

  private get bulkWithdrawCardStatuses(): CardStatus[] {
    return this.cardStatusCollection.data
      .filter((cardStatus) => cardStatus.status === CardStatusEnum.enum.isLockedByBulkWithdraw)
  }

  private async loadSetInfoForLnurlWs(): Promise<void> {
    this.setWithSettingsByLnurlW = await asTransaction(async (queries) => queries.getSetWithSettingsByLnurlW(this.lnurlWs.map((lnurlW) => lnurlW.lnbitsId)))
  }

  private openBulkWithdrawTaskFromLnurlW(lnurlW: LnurlW): OpenBulkwithdrawTask {
    const setWithSettings = this.setWithSettingsByLnurlW[lnurlW.lnbitsId]
    return OpenBulkwithdrawTask.fromData({
      set: {
        id: setWithSettings.id,
        created: setWithSettings.created,
        changed: setWithSettings.changed,
      },
      setSettings: setWithSettings.settings,
      cards: this.cardStatusesByLnurlW[lnurlW.lnbitsId].map((cardStatus) => new CardVersionWithInvoices(cardStatus.cardVersion, cardStatus.invoices)),
      lnurlW,
    })
  }
}
