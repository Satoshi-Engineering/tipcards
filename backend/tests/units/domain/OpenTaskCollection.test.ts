import { describe, it, expect } from 'vitest'

import {
  createSet, createSetSettings,
  createCardForSet, createCardVersion,
  createCard,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto.js'

import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import OpenTaskCollection from '@backend/domain/OpenTaskCollection.js'
import { OpenSetFundingTask } from '@backend/domain/OpenSetFundingTask.js'
import { OpenBulkwithdrawTask } from '@backend/domain/OpenBulkWithdrawTask.js'
import { OpenCardTask } from '@backend/domain/OpenCardTask.js'

describe('OpenTaskCollection', async () => {
  it('should build multiple open tasks', async () => {
    const { openCardTask, expectedOpenCardTaskDto } = getOpenCardTask()
    const { openSetTask, expectedOpenSetTaskDto } = getOpenSetTask()
    const { openBulkWithdrawTask, expectedOpenBulkWithdrawTaskDto } = getOpenBulkWithdrawTask()
    const openTasks = new OpenTaskCollection([
      openCardTask,
      openSetTask,
      openBulkWithdrawTask,
    ])

    expect(openTasks.toTrpcResponse()).toEqual(expect.arrayContaining([
      expectedOpenCardTaskDto,
      expectedOpenSetTaskDto,
      expectedOpenBulkWithdrawTaskDto,
    ]))
  })
})

const getOpenSetTask = () => {
  const set = createSet()
  const setSettings = createSetSettings(set)
  const card1 = createCardForSet(set, 0)
  const cardVersion1 = createCardVersion(card1)
  const card2 = createCardForSet(set, 1)
  const cardVersion2 = createCardVersion(card2)
  const { invoice } = createInvoice(420, cardVersion1, cardVersion2)
  const openSetTask = OpenSetFundingTask.fromData({
    set,
    setSettings,
    invoice: new InvoiceWithSetFundingInfo(invoice, 2),
  })
  const expectedOpenSetTaskDto = {
    type: OpenTaskType.enum.setAction,
    created: invoice.created,
    sats: invoice.amount,
    cardStatus: CardStatusEnum.enum.setInvoiceFunding,
    setId: set.id,
    setSettings: SetSettingsDto.parse(setSettings),
    cardCount: 2,
  }
  return { openSetTask, expectedOpenSetTaskDto }
}

const getOpenBulkWithdrawTask = () => {
  const set = createSet()
  const setSettings = createSetSettings(set)
  const card1 = createCardForSet(set, 0)
  const cardVersion1 = createCardVersion(card1)
  const card2 = createCardForSet(set, 1)
  const cardVersion2 = createCardVersion(card2)
  const { invoice } = createInvoice(420, cardVersion1, cardVersion2)
  invoice.paid = invoice.created
  const cards = [
    new CardVersionWithInvoices(
      cardVersion1,
      [new InvoiceWithSetFundingInfo(invoice, 2)],
    ),
    new CardVersionWithInvoices(
      cardVersion2,
      [new InvoiceWithSetFundingInfo(invoice, 2)],
    ),
  ]
  const lnurlW = createLnurlW(cardVersion1, cardVersion2)

  const openBulkWithdrawTask = OpenBulkwithdrawTask.fromData({
    set,
    setSettings,
    cards,
    lnurlW,
  })
  const expectedOpenBulkWithdrawTaskDto = {
    type: OpenTaskType.enum.setAction,
    created: lnurlW.created,
    sats: 420,
    cardStatus: CardStatusEnum.enum.isLockedByBulkWithdraw,
    setId: set.id,
    setSettings: SetSettingsDto.parse(setSettings),
    cardCount: 2,
  }
  return { openBulkWithdrawTask, expectedOpenBulkWithdrawTaskDto }
}

const getOpenCardTask = () => {
  const card = createCard()
  const cardVersion = createCardVersion(card)
  const { invoice } = createInvoice(210, cardVersion)

  const openCardTask = OpenCardTask.fromData({
    cardVersion,
    invoices: [invoice],
    lnurlP: null,
  })
  const expectedOpenCardTaskDto = {
    type: OpenTaskType.enum.cardAction,
    created: invoice.created,
    sats: 210,
    cardStatus: CardStatusEnum.enum.invoiceFunding,
    cardHash: card.hash,
    noteForStatusPage: cardVersion.noteForStatusPage,
    textForWithdraw: cardVersion.textForWithdraw,
  }
  return { openCardTask, expectedOpenCardTaskDto }
}
