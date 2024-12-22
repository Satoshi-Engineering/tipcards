import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import CardStatusCollection from './CardStatusCollection.js'
import { OpenCardTask } from './OpenCardTask.js'
import CardStatus from './CardStatus.js'

export default class OpenTaskBuilder {
  public readonly cardStatusCollection: CardStatusCollection

  public constructor(cardStatusCollection: CardStatusCollection) {
    this.cardStatusCollection = cardStatusCollection
  }

  public async build(): Promise<void> {
    this._openCardTasks = this.cardStatusWithOpenTasks.map(this.openCardTaskFromCardStatus)
  }

  public get openTasks(): OpenCardTask[] {
    return [...this._openCardTasks]
  }

  private _openCardTasks: OpenCardTask[] = []

  private get cardStatusWithOpenTasks(): CardStatus[] {
    return this.cardStatusCollection.data
      .filter((cardStatus) => ([
        CardStatusEnum.enum.invoiceFunding,
        CardStatusEnum.enum.lnurlpFunding,
        CardStatusEnum.enum.lnurlpSharedFunding,
        CardStatusEnum.enum.invoiceExpired,
        CardStatusEnum.enum.lnurlpExpired,
        CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
        CardStatusEnum.enum.lnurlpSharedExpiredFunded,
      ] as CardStatusEnum[]).includes(cardStatus.status))
  }

  private openCardTaskFromCardStatus(cardStatus: CardStatus): OpenCardTask {
    return OpenCardTask.fromData({
      cardVersion: cardStatus.cardVersion,
      invoices: cardStatus.invoices.map(({ invoice }) => invoice),
      lnurlP: cardStatus.lnurlP,
    })
  }
}
