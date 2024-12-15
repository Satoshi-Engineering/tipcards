import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenSetTaskDto, OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto.js'

import { Set, SetSettings } from '@backend/database/schema/index.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

import type IOpenTask from './IOpenTask.js'

export class OpenSetFundingTask implements IOpenTask {
  public static fromData(data: {
    set: Set,
    setSettings: SetSettings,
    invoice: InvoiceWithSetFundingInfo,
  }): OpenSetFundingTask {
    return new OpenSetFundingTask(data)
  }

  public readonly set: Set
  public readonly setSettings: SetSettings
  public readonly invoice: InvoiceWithSetFundingInfo

  public toTrpcResponse(): OpenSetTaskDto {
    return {
      type: OpenTaskType.enum.setAction,
      created: this.created,
      sats: this.invoice.invoice.amount,
      cardStatus: this.cardStatus,
      setId: this.set.id,
      setSettings: SetSettingsDto.parse(this.setSettings),
      cardCount: this.invoice.cardsFundedWithThisInvoice,
    }
  }

  public get created(): Date {
    return this.invoice.invoice.created
  }

  public get cardStatus() {
    if (this.invoice.invoice.expiresAt < new Date()) {
      return CardStatusEnum.enum.setInvoiceExpired
    }
    return CardStatusEnum.enum.setInvoiceFunding
  }

  private constructor(data: {
    set: Set,
    setSettings: SetSettings,
    invoice: InvoiceWithSetFundingInfo,
  }) {
    this.set = data.set
    this.setSettings = data.setSettings
    this.invoice = data.invoice
  }
}
