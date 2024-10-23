import assert from 'node:assert'

import {
  CardStatusEnum,
  CardStatusDto,
} from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  Card, CardVersion,
  LnurlP, LnurlW,
} from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'
import { isLnbitsWithdrawLinkUsed } from '@backend/services/lnbitsHelpers.js'

export default class CardStatus {
  public static async latestFromCardHashOrDefault(cardHash: Card['hash']): Promise<CardStatus> {
    const cardVersion = await asTransaction(async (queries) => queries.getLatestCardVersion(cardHash))
    return CardStatus.fromCardVersionOrDefault(cardHash, cardVersion)
  }

  private static async fromCardVersionOrDefault(cardHash: Card['hash'], cardVersion: CardVersion | null): Promise<CardStatus> {
    if (cardVersion == null) {
      return new CardStatus({
        id: '00000000-0000-0000-0000-000000000000',
        card: cardHash,
        created: new Date(),
        lnurlP: null,
        lnurlW: null,
        textForWithdraw: '',
        noteForStatusPage: '',
        sharedFunding: false,
        landingPageViewed: null,
      })
    }
    return CardStatus.fromCardVersion(cardVersion)
  }

  private static async fromCardVersion(cardVersion: CardVersion): Promise<CardStatus> {
    const status = new CardStatus(cardVersion)
    await status.loadSatoshiMovements()
    return status
  }

  /**
   * @throws ZodError
   * @throws ErrorWithCode
   */
  public toTrpcResponse(): CardStatusDto {
    return {
      hash: this.cardVersion.card,

      status: this.status,
      amount: this.amount,
      created: this.cardVersion.created,
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

  private readonly cardVersion: CardVersion
  private invoices: InvoiceWithSetFundingInfo[] = []
  private lnurlP: LnurlP | null = null
  private lnurlW: LnurlW | null = null
  private withdrawPending: boolean = false

  private constructor(cardVersion: CardVersion) {
    this.cardVersion = cardVersion
  }

  private async loadSatoshiMovements(): Promise<void> {
    await Promise.all([
      this.loadInvoices(),
      this.loadLnurlP(),
      this.loadLnurlW(),
    ])
    await this.resolveWithdrawPending()
  }

  private async loadInvoices(): Promise<void> {
    this.invoices = await asTransaction(async (queries) => queries.getAllInvoicesFundingCardVersionWithSetFundingInfo(this.cardVersion))
  }

  private async loadLnurlP(): Promise<void> {
    this.lnurlP = await asTransaction(async (queries) => queries.getLnurlPFundingCardVersion(this.cardVersion))
  }

  private async loadLnurlW(): Promise<void> {
    this.lnurlW = await asTransaction(async (queries) => queries.getLnurlWWithdrawingCardVersion(this.cardVersion))
  }

  private async resolveWithdrawPending(): Promise<void> {
    if (this.lnurlW == null || this.lnurlW.withdrawn != null) {
      return
    }

    if (await isLnbitsWithdrawLinkUsed(this.lnurlW.lnbitsId)) {
      this.withdrawPending = true
    }
  }

  private lnurlwStatus(): CardStatusEnum {
    assert(this.lnurlW != null, 'lnurlwStatus called without lnurlW')

    if (this.lnurlW.bulkWithdrawId != null) {
      if (this.withdrawPending) {
        return CardStatusEnum.enum.bulkWithdrawPending
      }
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

    if (this.withdrawPending) {
      return CardStatusEnum.enum.withdrawPending
    }

    return CardStatusEnum.enum.funded
  }

  private lnurlpStatus(): CardStatusEnum {
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

  private invoiceStatus(): CardStatusEnum {
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
