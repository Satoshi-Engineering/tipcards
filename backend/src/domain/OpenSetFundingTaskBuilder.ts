import assert from 'node:assert'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { asTransaction } from '@backend/database/client.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

import CardStatusCollection from './CardStatusCollection.js'
import { OpenSetFundingTask } from './OpenSetFundingTask.js'
import CardStatus from './CardStatus.js'
import type { SetWithSettings } from '@backend/database/data/SetWithSettings.js'

export default class OpenTaskBuilder {
  public readonly cardStatusCollection: CardStatusCollection

  public constructor(cardStatusCollection: CardStatusCollection) {
    this.cardStatusCollection = cardStatusCollection
  }

  public async build(): Promise<void> {
    this.getSetInvoicesFromCardStatuses()
    await this.loadSetInfoForInvoices()
    this.openSetFundingTasks = this.setInvoices.map((invoice) => this.openSetFundingTaskFromSetInvoice(invoice))
  }

  public get openTasks(): OpenSetFundingTask[] {
    return [...this.openSetFundingTasks]
  }

  private openSetFundingTasks: OpenSetFundingTask[] = []
  private setFundingInvoicesByPaymentHash: Record<string, InvoiceWithSetFundingInfo> = {}
  private get paymentHashes(): string[] {
    return Object.keys(this.setFundingInvoicesByPaymentHash)
  }
  private get setInvoices(): InvoiceWithSetFundingInfo[] {
    return Object.values(this.setFundingInvoicesByPaymentHash)
  }
  private setWithSettingsBySetFundingPaymentHash: Record<string, SetWithSettings> = {}

  private getSetInvoicesFromCardStatuses(): void {
    this.setFundingInvoicesByPaymentHash = this.cardStatusesWithOpenSetFundingTasks.reduce<Record<string, InvoiceWithSetFundingInfo>>((acc, cardStatus) => {
      const invoice = this.getSetFundingInvoiceFromCardStatus(cardStatus)
      acc[invoice.invoice.paymentHash] = invoice
      return acc
    }, {})
  }

  private getSetFundingInvoiceFromCardStatus(cardStatus: CardStatus): InvoiceWithSetFundingInfo {
    // the only time multiple invoices for a card are allowed is in case of a shared funding.
    // in case of a shared funding there is no set funding allowed.
    assert(cardStatus.invoices.length === 1, `Expected exactly one invoice for set funding cardStatus: ${cardStatus.cardVersion.card}`)
    return cardStatus.invoices[0]
  }

  private async loadSetInfoForInvoices(): Promise<void> {
    this.setWithSettingsBySetFundingPaymentHash = await asTransaction(async (queries) => queries.getSetWithSettingsBySetFundingPaymentHash(this.paymentHashes))
  }

  private get cardStatusesWithOpenSetFundingTasks(): CardStatus[] {
    return this.cardStatusCollection.data
      .filter((cardStatus) =>
        cardStatus.status === CardStatusEnum.enum.setInvoiceFunding
        || cardStatus.status === CardStatusEnum.enum.setInvoiceExpired,
      )
  }

  private openSetFundingTaskFromSetInvoice(invoice: InvoiceWithSetFundingInfo): OpenSetFundingTask {
    const setWithSettings = this.setWithSettingsBySetFundingPaymentHash[invoice.invoice.paymentHash]
    return OpenSetFundingTask.fromData({
      set: {
        id: setWithSettings.id,
        created: setWithSettings.created,
        changed: setWithSettings.changed,
      },
      setSettings: setWithSettings.settings,
      invoice,
    })
  }
}
