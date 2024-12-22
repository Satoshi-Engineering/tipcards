import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import {
  createSet, createSetSettings,
  createCardForSet, createCardVersion,
  createInvoice,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import OpenSetFundingTaskBuilder from '@backend/domain/OpenSetFundingTaskBuilder.js'
import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenSetFundingTaskBuilder', () => {
  it('should build an open set funding task', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    setSettings.numberOfCards = 2
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(420, cardVersion1, cardVersion2)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })
    const cardStatus1 = CardStatus.fromData({
      cardVersion: cardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatus2 = CardStatus.fromData({
      cardVersion: cardVersion2,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus1, cardStatus2])

    const builder = new OpenSetFundingTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(builder.openTasks.length).toEqual(1)
    expect(openTask.set).toEqual(set)
    expect(openTask.setSettings).toEqual(setSettings)
    expect(openTask.invoice).toEqual(new InvoiceWithSetFundingInfo(invoice, 2))
    expect(openTask.created).toEqual(invoice.created)
    expect(openTask.sats).toEqual(invoice.amount)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.setInvoiceFunding)
  })

  it('should build an expired open set funding task', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    setSettings.numberOfCards = 2
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(420, cardVersion1, cardVersion2)
    invoice.created = new Date(0)
    invoice.expiresAt = new Date(5 * 60 * 1000)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })
    const cardStatus1 = CardStatus.fromData({
      cardVersion: cardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatus2 = CardStatus.fromData({
      cardVersion: cardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus1, cardStatus2])

    const builder = new OpenSetFundingTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.set).toEqual(set)
    expect(openTask.setSettings).toEqual(setSettings)
    expect(openTask.invoice).toEqual(new InvoiceWithSetFundingInfo(invoice, 2))
    expect(openTask.created).toEqual(invoice.created)
    expect(openTask.sats).toEqual(invoice.amount)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.setInvoiceExpired)
  })
})
