import { describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlP,
  createLnurlW,
} from '../../drizzleData.js'

import CardStatusBuilder from '@backend/domain/CardStatusBuilder.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
let lnurlW: LnurlW

beforeAll(() => {
  addData({
    cards: [card],
    cardVersions: [cardVersion],
    invoices: [invoice],
    cardVersionInvoices: [...cardVersionsHaveInvoice],
  })
})

describe('CardStatusBuilder', () => {
  it('should build a default card status', async () => {
    const builder = new CardStatusBuilder('nonexistent')
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion.card).toBe('nonexistent')
    expect(status.invoices).toEqual([])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toBeNull()
  })

  it('should resolve an invoice', async () => {
    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toBeNull()
  })

  it('should resolve an invoice from a set funding', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(300, cardVersion1, cardVersion2)
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const builder = new CardStatusBuilder(card1.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion1)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 2 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toBeNull()
  })

  it('should resolve a lnurlP', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.finished = new Date(1230980400000)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(200, cardVersion)
    invoice.extra = JSON.stringify({ lnurlp: lnurlP.lnbitsId })
    invoice.paid = new Date(1230980400000)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      lnurlps: [lnurlP],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toEqual(lnurlP)
    expect(status.lnurlW).toBeNull()
  })

  it('should resolve multiple invoices from shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.finished = new Date(1230980500000)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionsHaveInvoice1 } = createInvoice(150, cardVersion)
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionsHaveInvoice2 } = createInvoice(150, cardVersion)
    invoice1.extra = JSON.stringify({ lnurlp: lnurlP.lnbitsId })
    invoice1.paid = new Date(1230980400000)
    invoice2.extra = JSON.stringify({ lnurlp: lnurlP.lnbitsId })
    invoice2.paid = new Date(1230980400000)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      lnurlps: [lnurlP],
      invoices: [invoice1, invoice2],
      cardVersionInvoices: [...cardVersionsHaveInvoice1, ...cardVersionsHaveInvoice2],
    })

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual(expect.arrayContaining([
      expect.objectContaining({ invoice: invoice1, cardsFundedWithThisInvoice: 1 }),
      expect.objectContaining({ invoice: invoice2, cardsFundedWithThisInvoice: 1 }),
    ]))
    expect(status.lnurlP).toEqual(lnurlP)
    expect(status.lnurlW).toBeNull()
  })

  it('should resolve a lnurlW', async () => {
    lnurlW = createLnurlW(cardVersion)
    addData({ lnurlws: [lnurlW] })

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toEqual(lnurlW)
  })

  it('should build a collection for a single cardHash', async () => {
    const builder = new CardStatusBuilder('nonexistent')
    await builder.build()
    const collection = builder.getCardStatusCollection()

    expect(collection).toEqual(expect.objectContaining({
      cardStatuses: expect.arrayContaining([
        expect.objectContaining({
          cardVersion: expect.objectContaining({ card: 'nonexistent' }),
          invoices: [],
        }),
      ]),
    }))
  })

  it('should build a collection for multiple cardHashes', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(300, cardVersion1, cardVersion2)
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const builder = new CardStatusBuilder([card1.hash, card2.hash])
    await builder.build()
    const collection = builder.getCardStatusCollection()

    expect(collection).toEqual(expect.objectContaining({
      cardStatuses: expect.arrayContaining([
        expect.objectContaining({
          cardVersion: cardVersion1,
          invoices: [expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 2 })],
        }),
        expect.objectContaining({
          cardVersion: cardVersion2,
          invoices: [expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 2 })],
        }),
      ]),
    }))
  })
})
