import assert from 'node:assert'

import {
  CardStatusEnum as TrpcCardStatusEnum,
  CardStatus as TrpcCardStatus,
} from '@shared/data/trpc/CardStatus.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import {
  Card, CardVersion,
  LnurlP, LnurlW,
} from '@backend/database/schema/index.js'
import { asTransaction } from '@backend/database/client.js'

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
  public toTrpcResponse(): TrpcCardStatus {
    return {
      hash: this.cardVersion.card,

      status: this.status,
      amount: this.amount,
      created: this.cardVersion.created,
      funded: this.lnurlW?.created ?? null,
      withdrawn: this.lnurlW?.withdrawn ?? null,
    }
  }

  public get status(): TrpcCardStatusEnum {
    if (this.invoices.length === 0) {
      return TrpcCardStatusEnum.enum.unfunded
    }

    if (this.lnurlW != null) {
      if (this.lnurlW.withdrawn != null) {
        if (this.lnurlW.withdrawn.getTime() > Date.now() - 1000 * 60 * 5) {
          return TrpcCardStatusEnum.enum.recentlyWithdrawn
        }
        return TrpcCardStatusEnum.enum.withdrawn
      }
      // todo : handle withdrawPending
      return TrpcCardStatusEnum.enum.funded
    }

    if (this.lnurlP != null) {
      if (this.lnurlP.finished != null) {
        return TrpcCardStatusEnum.enum.funded
      }
      if (this.cardVersion.sharedFunding) {
        if (this.lnurlP.expiresAt != null && this.lnurlP.expiresAt > new Date()) {
          if (this.amount === 0) {
            return TrpcCardStatusEnum.enum.lnurlpSharedExpiredFunded
          }
          return TrpcCardStatusEnum.enum.lnurlpSharedExpiredEmpty
        }
        return TrpcCardStatusEnum.enum.lnurlpSharedFunding
      }
      if (this.lnurlP.expiresAt != null && this.lnurlP.expiresAt > new Date()) {
        return TrpcCardStatusEnum.enum.lnurlpExpired
      }
      return TrpcCardStatusEnum.enum.lnurlpFunding
    }

    assert(
      this.invoices.length === 1,
      `More than one invoice for cardVersion ${this.cardVersion.id} even though not lnurlP sharedFunding`,
    )

    const invoice = this.invoices[0]
    if (invoice.isPaid) {
      return TrpcCardStatusEnum.enum.funded
    }
    if (invoice.isExpired) {
      if (invoice.isSetFunding) {
        return TrpcCardStatusEnum.enum.setInvoiceExpired
      }
      return TrpcCardStatusEnum.enum.invoiceExpired
    }
    if (invoice.isSetFunding) {
      return TrpcCardStatusEnum.enum.setInvoiceFunding
    }
    return TrpcCardStatusEnum.enum.invoiceFunding
  }

  public get amount(): number | null {
    if (this.invoices.length === 0) {
      return null
    }
    if (
      this.lnurlP == null
      && this.invoices.length === 1
    ) {
      return this.invoices[0].amountPerCard
    }
    return this.invoices
      .filter((invoice) => invoice.isPaid)
      .reduce((sum, invoice) => sum + invoice.amountPerCard, 0)
  }

  private readonly cardVersion: CardVersion
  private invoices: InvoiceWithSetFundingInfo[] = []
  private lnurlP: LnurlP | null = null
  private lnurlW: LnurlW | null = null

  private constructor(cardVersion: CardVersion) {
    this.cardVersion = cardVersion
  }

  private async loadSatoshiMovements(): Promise<void> {
    await Promise.all([
      this.loadInvoices(),
      this.loadLnurlP(),
      this.loadLnurlW(),
    ])
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
}
