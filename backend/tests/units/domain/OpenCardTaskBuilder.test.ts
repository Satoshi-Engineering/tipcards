import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlP,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import OpenCardTaskBuilder from '@backend/domain/OpenCardTaskBuilder.js'
import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenCardTaskBuilder', () => {
  it('should build a card task for an unpaid invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(210, cardVersion)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.invoices).toEqual(expect.arrayContaining([invoice]))
    expect(openTask.lnurlP).toEqual(null)
    expect(openTask.created).toEqual(invoice.created)
    expect(openTask.amount).toEqual(invoice.amount)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.invoiceFunding)
  })

  it('should build a card task for an expired invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.created = new Date(0)
    invoice.expiresAt = new Date(5 * 60 * 1000)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.invoices).toEqual(expect.arrayContaining([invoice]))
    expect(openTask.lnurlP).toEqual(null)
    expect(openTask.created).toEqual(invoice.created)
    expect(openTask.amount).toEqual(invoice.amount)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.invoiceExpired)
  })

  it('should build a card task for a lnurlp funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlP = createLnurlP(cardVersion)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(0)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpFunding)
  })

  it('should build a card task for an expired lnurlp', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(0)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpExpired)
  })

  it('should build a card task for a shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(0)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpSharedFunding)
  })

  it('should build a card task for an expired shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(0)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpSharedExpiredEmpty)
  })

  it('should build a card task for a shared funding, with some sats funded already', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.paid = new Date()
    invoice.extra = `{ "lnurlp": "${lnurlP.lnbitsId}" }`
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(210)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpSharedFunding)
  })

  it('should build a card task for an expired shared funding, with some sats funded already', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.paid = new Date()
    invoice.extra = `{ "lnurlp": "${lnurlP.lnbitsId}" }`
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.lnurlP).toEqual(lnurlP)
    expect(openTask.created).toEqual(lnurlP.created)
    expect(openTask.amount).toEqual(210)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.lnurlpSharedExpiredFunded)
  })
})
