import assert from 'node:assert'

import {
  CardStatusEnum,
  type CardStatusDto,
} from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  Card, CardVersion,
  LnurlP, LnurlW,
} from '@backend/database/schema/index.js'

import CardStatusBuilder from './CardStatusBuilder.js'

export default class CardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']): Promise<CardStatus> {
    const builder = new CardStatusBuilder(cardHash)
    await builder.build()
    return builder.getCardStatus()
  }

  public static fromData(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
  }): CardStatus {
    const status = new CardStatus(data)
    return status
  }

  public toTrpcResponse(): CardStatusDto {
    return {
      hash: this.cardVersion.card,

      status: this.status,
      amount: this.amount,
      created: this.created,
      funded: this.funded,
      withdrawn: this.lnurlW?.withdrawn ?? null,
    }
  }

  public get status(): CardStatusEnum {
    if (this.lnurlW != null) {
      return this.lnurlwStatus()
    }
    if (this.lnurlP != null) {
      return this.lnurlpStatus()
    }
    return this.invoiceStatus()
  }

  public get amount(): number | null {
    if (this.isInvoiceFunding) {
      return this.invoices[0].amountPerCard
    }

    if (this.isLnurlpFunding) {
      return this.paidAmount
    }

    return null
  }

  public get created(): Date {
    return this.lnurlP?.created
      ?? this.invoices[0]?.invoice.created
      ?? this.cardVersion.created
  }

  public get funded(): Date | null {
    if (this.isInvoiceFunding) {
      return this.invoices[0].invoice.paid
    }
    if (this.isLnurlpFunding) {
      return this.lnurlP?.finished ?? null
    }
    return null
  }

  public get isInvoiceFunding(): boolean {
    return this.lnurlP == null && this.invoices.length === 1
  }

  public get isLnurlpFunding(): boolean {
    return this.lnurlP != null
  }

  public get paidAmount(): number {
    return this.invoices
      .filter((invoice) => invoice.isPaid)
      .reduce((sum, invoice) => sum + invoice.amountPerCard, 0)
  }

  public readonly cardVersion: CardVersion
  public readonly invoices: InvoiceWithSetFundingInfo[]
  public readonly lnurlP: LnurlP | null
  public readonly lnurlW: LnurlW | null

  protected constructor(data: {
    cardVersion: CardVersion,
    invoices: InvoiceWithSetFundingInfo[],
    lnurlP: LnurlP | null,
    lnurlW: LnurlW | null,
  }) {
    this.cardVersion = data.cardVersion
    this.invoices = data.invoices
    this.lnurlP = data.lnurlP
    this.lnurlW = data.lnurlW
  }

  protected lnurlwStatus(): CardStatusEnum {
    assert(this.lnurlW != null, 'lnurlwStatus called without lnurlW')

    if (this.lnurlW.bulkWithdrawId != null) {
      if (this.lnurlW.withdrawn != null) {
        return CardStatusEnum.enum.withdrawnByBulkWithdraw
      }
      return CardStatusEnum.enum.isLockedByBulkWithdraw
    }

    if (this.lnurlW.withdrawn != null) {
      if (this.lnurlW.withdrawn.getTime() > Date.now() - 1000 * 60 * 5) {
        return CardStatusEnum.enum.recentlyWithdrawn
      }
      return CardStatusEnum.enum.withdrawn
    }

    return CardStatusEnum.enum.funded
  }

  protected lnurlpStatus(): CardStatusEnum {
    assert(this.lnurlP != null, 'lnurlpStatus called without lnurlP')

    if (this.lnurlP.finished != null) {
      return CardStatusEnum.enum.funded
    }

    if (this.cardVersion.sharedFunding) {
      if (this.lnurlP.expiresAt != null && this.lnurlP.expiresAt < new Date()) {
        if (this.amount != null && this.amount > 0) {
          return CardStatusEnum.enum.lnurlpSharedExpiredFunded
        }
        return CardStatusEnum.enum.lnurlpSharedExpiredEmpty
      }
      return CardStatusEnum.enum.lnurlpSharedFunding
    }

    if (this.lnurlP.expiresAt != null && this.lnurlP.expiresAt < new Date()) {
      return CardStatusEnum.enum.lnurlpExpired
    }

    return CardStatusEnum.enum.lnurlpFunding
  }

  protected invoiceStatus(): CardStatusEnum {
    if (this.invoices.length === 0) {
      return CardStatusEnum.enum.unfunded
    }

    assert(
      this.invoices.length === 1,
      `More than one invoice for cardVersion ${this.cardVersion.id} even though not lnurlP sharedFunding`,
    )

    const invoice = this.invoices[0]
    if (invoice.isPaid) {
      return CardStatusEnum.enum.funded
    }
    if (invoice.isExpired) {
      if (invoice.isSetFunding) {
        return CardStatusEnum.enum.setInvoiceExpired
      }
      return CardStatusEnum.enum.invoiceExpired
    }
    if (invoice.isSetFunding) {
      return CardStatusEnum.enum.setInvoiceFunding
    }
    return CardStatusEnum.enum.invoiceFunding
  }
}
