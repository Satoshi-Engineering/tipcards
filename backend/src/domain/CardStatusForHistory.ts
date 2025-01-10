import type { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  SetSettings,
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
    // ATTENTION: currently the setSettings resolver only works for set funded cards, so use with caution!
    // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/1357#note_20913
    setSettings: SetSettings | null,
  }): CardStatusForHistory {
    return new CardStatusForHistory(data)
  }

  public readonly setSettings: SetSettings | null

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

      setId: this.setSettings?.set ?? null,
      setName: this.setSettings?.name ?? null,

      created: this.created,
      funded: this.funded,
      withdrawn: this.lnurlW?.withdrawn ?? null,

      noteForStatusPage: this.cardVersion.noteForStatusPage,
      textForWithdraw: this.cardVersion.textForWithdraw,
      landingPageViewed: this.cardVersion.landingPageViewed,
      bulkWithdrawCreated: this.bulkWithdrawCreated,
    }
  }

  protected constructor(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
    setSettings: SetSettings | null,
  }) {
    super(data)
    this.setSettings = data.setSettings
  }
}
