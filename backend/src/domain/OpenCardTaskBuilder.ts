import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import CardStatusCollection from './CardStatusCollection.js'
import { OpenCardTask } from './OpenCardTask.js'
import CardStatus from './CardStatus.js'

export default class OpenCardTaskBuilder {
  public readonly cardStatusCollection: CardStatusCollection

  public constructor(cardStatusCollection: CardStatusCollection) {
    this.cardStatusCollection = cardStatusCollection
  }

  public async build(): Promise<void> {
    this.openCardTasks = this.cardStatusesWithOpenTasks.map((cardStatus) => this.openCardTaskFromCardStatus(cardStatus))
  }

  public get openTasks(): OpenCardTask[] {
    return [...this.openCardTasks]
  }

  private openCardTasks: OpenCardTask[] = []

  private get cardStatusesWithOpenTasks(): CardStatus[] {
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
