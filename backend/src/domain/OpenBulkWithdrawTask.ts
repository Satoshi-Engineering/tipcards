import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenSetTaskDto, OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto.js'

import { LnurlW, Set, SetSettings } from '@backend/database/schema/index.js'
import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'

import IOpenTask from './IOpenTask.js'

export class OpenBulkwithdrawTask implements IOpenTask {
  public static fromData(data: {
    set: Set,
    setSettings: SetSettings,
    cards: CardVersionWithInvoices[],
    lnurlW: LnurlW,
  }): OpenBulkwithdrawTask {
    return new OpenBulkwithdrawTask(data)
  }

  public readonly set: Set
  public readonly setSettings: SetSettings
  public readonly cards: CardVersionWithInvoices[]
  public readonly lnurlW: LnurlW

  public toTrpcResponse(): OpenSetTaskDto {
    return {
      type: OpenTaskType.enum.setAction,
      created: this.created,
      sats: this.sats,
      cardStatus: CardStatusEnum.enum.isLockedByBulkWithdraw,
      setId: this.set.id,
      setSettings: SetSettingsDto.parse(this.setSettings),
      cardCount: this.cards.length,
    }
  }

  public get created(): Date {
    return this.lnurlW.created
  }

  public get sats(): number {
    return this.cards.reduce((acc, card) => acc + card.amountPaid, 0)
  }

  private constructor(data: {
    set: Set,
    setSettings: SetSettings,
    cards: CardVersionWithInvoices[],
    lnurlW: LnurlW,
  }) {
    this.set = data.set
    this.setSettings = data.setSettings
    this.cards = data.cards
    this.lnurlW = data.lnurlW
  }
}
