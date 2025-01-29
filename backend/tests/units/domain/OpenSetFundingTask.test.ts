import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createSet, createSetSettings,
  createCardVersion,
  createInvoice,
  createCardForSet,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto.js'

import { OpenSetFundingTask } from '@backend/domain/OpenSetFundingTask.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenSetFundingTask', () => {
  it('should build the correct OpenSetTaskDto', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const { invoice } = createInvoice(420, cardVersion1, cardVersion2)

    const openTask = OpenSetFundingTask.fromData({
      set,
      setSettings,
      invoice: new InvoiceWithSetFundingInfo(invoice, 2),
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.setAction,
      created: invoice.created,
      amount: invoice.amount,
      feeAmount: invoice.feeAmount,
      cardStatus: CardStatusEnum.enum.setInvoiceFunding,
      setId: set.id,
      setSettings: SetSettingsDto.parse(setSettings),
      cardCount: 2,
    })
  })

  it('should build the correct OpenSetTaskDto for an expired invoice', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const { invoice } = createInvoice(420, cardVersion1, cardVersion2)
    invoice.created = new Date(0)
    invoice.expiresAt = new Date(5 * 60 * 1000)

    const openTask = OpenSetFundingTask.fromData({
      set,
      setSettings,
      invoice: new InvoiceWithSetFundingInfo(invoice, 2),
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.setAction,
      created: invoice.created,
      amount: invoice.amount,
      feeAmount: invoice.feeAmount,
      cardStatus: CardStatusEnum.enum.setInvoiceExpired,
      setId: set.id,
      setSettings: SetSettingsDto.parse(setSettings),
      cardCount: 2,
    })
  })
})
