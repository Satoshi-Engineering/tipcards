import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { asTransaction } from '@backend/database/client.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'

import CardStatusCollection from './CardStatusCollection.js'
import CardStatus from './CardStatus.js'
import { OpenBulkwithdrawTask } from './OpenBulkWithdrawTask.js'
import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'

export default class OpenTaskBuilder {
  public readonly cardStatusCollection: CardStatusCollection

  public constructor(cardStatusCollection: CardStatusCollection) {
    this.cardStatusCollection = cardStatusCollection
  }

  public async build(): Promise<void> {
    const bulkWithdrawCardStatuses = this.cardStatusCollection.data
      .filter((cardStatus) => cardStatus.status === CardStatusEnum.enum.isLockedByBulkWithdraw)
    const openTasksByLnurlW = bulkWithdrawCardStatuses.reduce<Record<string, { cardStatuses: CardStatus[], lnurlW: LnurlW }>>((acc, cardStatus) => {
      const lnurlW = cardStatus.lnurlW
      if (lnurlW == null) {
        return acc
      }
      if (acc[lnurlW.lnbitsId] == null) {
        acc[lnurlW.lnbitsId] = {
          cardStatuses: [],
          lnurlW,
        }
      }
      acc[lnurlW.lnbitsId].cardStatuses.push(cardStatus)
      return acc
    }, {})
    const setWithSettingsByLnurlW = await asTransaction(async (queries) => queries.getSetWithSettingsByLnurlW(Object.keys(openTasksByLnurlW)))
    this.openBulkWithdrawTasks = Object.values(openTasksByLnurlW)
      .map(({ cardStatuses, lnurlW }) => {
        const setWithSettings = setWithSettingsByLnurlW[lnurlW.lnbitsId]
        return OpenBulkwithdrawTask.fromData({
          set: {
            id: setWithSettings.id,
            created: setWithSettings.created,
            changed: setWithSettings.changed,
          },
          setSettings: setWithSettings.settings,
          cards: cardStatuses.map((cardStatus) => new CardVersionWithInvoices(cardStatus.cardVersion, cardStatus.invoices)),
          lnurlW,
        })
      })
  }

  public get openTasks(): OpenBulkwithdrawTask[] {
    return [...this.openBulkWithdrawTasks]
  }

  private openBulkWithdrawTasks: OpenBulkwithdrawTask[] = []
}
