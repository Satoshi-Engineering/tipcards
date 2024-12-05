import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  Card, CardVersion,
  LnurlP, LnurlW,
} from '@backend/database/schema/index.js'

import CardStatus from './CardStatus.js'
import CardStatusForHistoryBuilder from './CardStatusForHistoryBuilder.js'

export default class CardStatusForHistory extends CardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']): Promise<CardStatusForHistory> {
    const builder = new CardStatusForHistoryBuilder(cardHash)
    await builder.build()
    return builder.cardStatuses[0]
  }

  public static fromData(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
    setName: string | null,
  }): CardStatusForHistory {
    return new CardStatusForHistory(data)
  }

  public readonly setName: string | null

  public get updated(): Date {
    return this.lnurlW?.withdrawn
      ?? this.bulkWithdrawCreated
      ?? this.cardVersion.landingPageViewed
      ?? this.funded
      ?? this.created
  }

  public get bulkWithdrawCreated(): Date | null {
    if (this.lnurlW?.bulkWithdrawId != null) {
      return this.lnurlW.created
    }
    return null
  }

  public toTrpcResponse(): CardStatusForHistoryDto {
    return {
      ...super.toTrpcResponse(),
      landingPageViewed: this.cardVersion.landingPageViewed,
      bulkWithdrawCreated: this.bulkWithdrawCreated,
      setName: this.setName,
      noteForStatusPage: this.cardVersion.noteForStatusPage,
      textForWithdraw: this.cardVersion.textForWithdraw,
    }
  }

  protected constructor(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
    setName: string | null,
  }) {
    super(data)
    this.setName = data.setName
  }
}
