import assert from 'node:assert'
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

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import CardStatus from '@backend/domain/CardStatus.js'
import CardStatusBuilder from '@backend/domain/CardStatusBuilder.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
let lnurlw: LnurlW

beforeAll(() => {
  addData({
    cards: [card],
    cardVersions: [cardVersion],
    invoices: [invoice],
    cardVersionInvoices: [...cardVersionsHaveInvoice],
  })
})

describe('Card', () => {
  it('should build a default card status', async () => {
    const builder = new CardStatusBuilder('nonexistent')
    await builder.build()
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: 'nonexistent',
      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: expect.any(Date),
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a card from cardHash', async () => {
    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.invoiceFunding,
      amount: 100,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle an expired invoice', async () => {
    invoice.expiresAt = new Date(0)

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.invoiceExpired,
      amount: 100,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a funded card', async () => {
    invoice.paid = new Date(1230980400000)

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })
  it('should load the status of a lnurlp funded card', async () => {
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
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 200,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a shared funded card', async () => {
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
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 300,
      created: cardVersion.created,
      funded: lnurlP.finished,
      withdrawn: null,
    }))
  })

  it('should load the status of a funded card with existing lnurlW', async () => {
    lnurlw = createLnurlW(cardVersion)
    addData({ lnurlws: [lnurlw] })

    const builder = new CardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getResult()

    assert(status instanceof CardStatus)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })
})
