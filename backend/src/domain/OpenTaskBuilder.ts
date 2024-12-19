import assert from 'node:assert'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'
import { asTransaction } from '@backend/database/client.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

import CardStatusCollection from './CardStatusCollection.js'
import type IOpenTask from './IOpenTask.js'
import SetCollection from './SetCollection.js'
import { OpenCardTask } from './OpenCardTask.js'
import { OpenBulkwithdrawTask } from './OpenBulkWithdrawTask.js'
import CardStatus from './CardStatus.js'
import { OpenSetFundingTask } from './OpenSetFundingTask.js'

export default class OpenTaskBuilder {
  public readonly userId: string

  public constructor(userId: string) {
    this.userId = userId
  }

  public async build(): Promise<void> {
    const setCollection = await SetCollection.fromUserId(this.userId)
    this.cardStatusCollection = await CardStatusCollection.fromCardHashes(setCollection.cardHashes)
    await Promise.all([
      this.buildOpenCardTasks(),
      this.buildOpenBulkWithdrawTasks(),
      this.buildOpenSetFundingTasks(),
    ])
  }

  public get openTasks(): IOpenTask[] {
    return [
      ...this.openCardTasks,
      ...this.openBulkwithdrawTasks,
      ...this.openSetFundingTasks,
    ]
  }

  private cardStatusCollection: CardStatusCollection = new CardStatusCollection([])
  private openCardTasks: OpenCardTask[] = []
  private openBulkwithdrawTasks: OpenBulkwithdrawTask[] = []
  private openSetFundingTasks: OpenSetFundingTask[] = []

  private async buildOpenCardTasks(): Promise<void> {
    this.openCardTasks = this.cardStatusCollection.data
      .filter((cardStatus) => ([
        CardStatusEnum.enum.invoiceFunding,
        CardStatusEnum.enum.lnurlpFunding,
        CardStatusEnum.enum.lnurlpSharedFunding,
        CardStatusEnum.enum.invoiceExpired,
        CardStatusEnum.enum.lnurlpExpired,
        CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
        CardStatusEnum.enum.lnurlpSharedExpiredFunded,
      ] as CardStatusEnum[]).includes(cardStatus.status))
      .map((cardStatus) => OpenCardTask.fromData({
        cardVersion: cardStatus.cardVersion,
        invoices: cardStatus.invoices.map(({ invoice }) => invoice),
        lnurlP: cardStatus.lnurlP,
      }))
  }

  private async buildOpenBulkWithdrawTasks(): Promise<void> {
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
    this.openBulkwithdrawTasks = Object.values(openTasksByLnurlW).map(({ cardStatuses, lnurlW }) => OpenBulkwithdrawTask.fromData({
      set: setWithSettingsByLnurlW[lnurlW.lnbitsId],
      setSettings: setWithSettingsByLnurlW[lnurlW.lnbitsId].settings,
      cards: cardStatuses.map((cardStatus) => new CardVersionWithInvoices(cardStatus.cardVersion, cardStatus.invoices)),
      lnurlW,
    }))
  }

  private async buildOpenSetFundingTasks(): Promise<void> {
    const setFundingCardStatuses = this.cardStatusCollection.data
      .filter((cardStatus) => cardStatus.status === CardStatusEnum.enum.setInvoiceFunding || cardStatus.status === CardStatusEnum.enum.setInvoiceExpired)
    const openTasksByInvoice = setFundingCardStatuses.reduce<Record<string, InvoiceWithSetFundingInfo>>((acc, cardStatus) => {
      assert(cardStatus.invoices.length === 1, `Expected exactly one invoice for set funding cardStatus: ${cardStatus.cardVersion.card}`)
      const invoice = cardStatus.invoices[0]
      acc[invoice.invoice.paymentHash] = invoice
      return acc
    }, {})
    const setWithSettingsBySetFundingPaymentHash = await asTransaction(async (queries) => queries.getSetWithSettingsBySetFundingPaymentHash(Object.keys(openTasksByInvoice)))
    this.openSetFundingTasks = Object.values(openTasksByInvoice).map((invoice) => OpenSetFundingTask.fromData({
      set: setWithSettingsBySetFundingPaymentHash[invoice.invoice.paymentHash],
      setSettings: setWithSettingsBySetFundingPaymentHash[invoice.invoice.paymentHash].settings,
      invoice,
    }))
  }
}
