import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import {
  createSet, createSetSettings,
  createCardForSet, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import OpenBulkWithdrawTaskBuilder from '@backend/domain/OpenBulkWithdrawTaskBuilder.js'
import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenBulkWithdrawTaskBuilder', () => {
  it('should build an open bulk withdraw task', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    setSettings.numberOfCards = 3
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const card3 = createCardForSet(set, 2)
    const cardVersion3 = createCardVersion(card3)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(630, cardVersion1, cardVersion2, cardVersion3)
    invoice.paid = new Date()
    const lnurlW1 = createLnurlW(cardVersion1, cardVersion2)
    const lnurlW2 = createLnurlW(cardVersion3)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlW1, lnurlW2],
    })
    const cardStatus1 = CardStatus.fromData({
      cardVersion: cardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 3)],
      lnurlP: null,
      lnurlW: lnurlW1,
    })
    const cardStatus2 = CardStatus.fromData({
      cardVersion: cardVersion2,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 3)],
      lnurlP: null,
      lnurlW: lnurlW1,
    })
    const cardStatus3 = CardStatus.fromData({
      cardVersion: cardVersion3,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 3)],
      lnurlP: null,
      lnurlW: lnurlW2,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus1, cardStatus2, cardStatus3])

    const builder = new OpenBulkWithdrawTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(builder.openTasks.length).toEqual(1)
    expect(openTask.set).toEqual(set)
    expect(openTask.setSettings).toEqual(setSettings)
    expect(openTask.created).toEqual(lnurlW1.created)
    expect(openTask.amount).toEqual(420)
  })
})
