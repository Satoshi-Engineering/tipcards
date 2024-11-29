import assert from 'node:assert'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  Card, CardVersion,
  LnurlP, LnurlW,
} from '@backend/database/schema/index.js'

import CardStatus from './CardStatus.js'
import LiveCardStatusBuilder from './LiveCardStatusBuilder.js'

export default class LiveCardStatus extends CardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']): Promise<LiveCardStatus> {
    const builder = new LiveCardStatusBuilder(cardHash)
    await builder.build()
    return builder.getCardStatus()
  }

  public static fromData(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
    withdrawPending: boolean,
  }): LiveCardStatus {
    return new LiveCardStatus(data)
  }

  public readonly withdrawPending: boolean

  protected constructor(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
    withdrawPending: boolean,
  }) {
    super(data)
    this.withdrawPending = data.withdrawPending
  }

  protected lnurlwStatus(): CardStatusEnum {
    assert(this.lnurlW != null, 'lnurlwStatus called without lnurlW')

    if (!this.withdrawPending) {
      return super.lnurlwStatus()
    }
    if (this.lnurlW.bulkWithdrawId != null) {
      return CardStatusEnum.enum.bulkWithdrawPending
    }
    return CardStatusEnum.enum.withdrawPending

  }
}
