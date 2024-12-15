import { OpenCardTaskDto, OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { CardVersion, Invoice, LnurlP } from '@backend/database/schema/index.js'

import type IOpenTask from './IOpenTask.js'

export class OpenCardTask implements IOpenTask {
  public static fromData(data: {
    cardVersion: CardVersion,
    invoices: Invoice[],
    lnurlP: LnurlP | null,
  }): OpenCardTask {
    return new OpenCardTask(data)
  }

  public readonly cardVersion: CardVersion
  public readonly invoices: Invoice[]
  public readonly lnurlP: LnurlP | null

  public toTrpcResponse(): OpenCardTaskDto {
    return {
      type: OpenTaskType.enum.cardAction,
      created: this.created,
      sats: this.sats,
      cardStatus: this.cardStatus,
      cardHash: this.cardVersion.card,
      noteForStatusPage: this.cardVersion.noteForStatusPage,
      textForWithdraw: this.cardVersion.textForWithdraw,
    }
  }

  public get created(): Date {
    if (this.lnurlP != null) {
      return this.lnurlP.created
    }
    return this.invoices.reduce((acc, invoice) => {
      if (invoice.created < acc) {
        return invoice.created
      }
      return acc
    }, new Date())
  }

  public get sats(): number {
    if (this.lnurlP == null) {
      return this.invoices.reduce((acc, invoice) => acc + invoice.amount, 0)
    }
    return this.invoices
      .filter(invoice => invoice.paid != null)
      .reduce((acc, invoice) => acc + invoice.amount, 0)
  }

  public get cardStatus() {
    // invoice funding
    if (this.lnurlP == null) {
      if (this.invoices.some(invoice => invoice.expiresAt < new Date())) {
        return CardStatusEnum.enum.invoiceExpired
      }
      return CardStatusEnum.enum.invoiceFunding
    }

    // lnurlp
    if (!this.cardVersion.sharedFunding) {
      if (this.lnurlP.expiresAt != null && this.lnurlP.expiresAt < new Date()) {
        return CardStatusEnum.enum.lnurlpExpired
      }
      return CardStatusEnum.enum.lnurlpFunding
    }

    // shared funding
    if (this.lnurlP.expiresAt == null || this.lnurlP.expiresAt >= new Date()) {
      return CardStatusEnum.enum.lnurlpSharedFunding
    }
    if (this.sats > 0) {
      return CardStatusEnum.enum.lnurlpSharedExpiredFunded
    }
    return CardStatusEnum.enum.lnurlpSharedExpiredEmpty
  }

  private constructor(data: {
    cardVersion: CardVersion,
    invoices: Invoice[],
    lnurlP: LnurlP | null,
  }) {
    this.cardVersion = data.cardVersion
    this.invoices = data.invoices
    this.lnurlP = data.lnurlP
  }
}
