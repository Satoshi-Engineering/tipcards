import { AssertionError } from 'node:assert'
import { describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import { isLnbitsWithdrawLinkUsed } from '../mocks/services/lnbitsHelpers.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import CardStatus from '@backend/domain/CardStatus.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
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
  it('should get the default status of a card that does not exist', async () => {
    const status = await CardStatus.latestFromCardHashOrDefault('nonexistent')

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
    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

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

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

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

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a funded card', async () => {
    lnurlw = createLnurlW(cardVersion)
    addData({ lnurlws: [lnurlw] })

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should handle a pending withdraw', async () => {
    isLnbitsWithdrawLinkUsed.mockImplementation(async () => true)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawPending,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a recently withdrawn card', async () => {
    lnurlw.withdrawn = new Date(Date.now() - 1000 * 60 * 4)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.recentlyWithdrawn,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: lnurlw.withdrawn,
    }))
  })

  it('should load the status of a withdrawn card', async () => {
    lnurlw.withdrawn = new Date(1230980400000)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawn,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: lnurlw.withdrawn,
    }))
  })

  it('should load the status of a card that has been withdrawn by bulkWithdraw', async () => {
    lnurlw.withdrawn = new Date(1230980400000)
    lnurlw.bulkWithdrawId = 'bulkWithdrawId'

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawnByBulkWithdraw,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: lnurlw.withdrawn,
    }))
  })

  it('should throw an error if a card has multiple invoices without shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionsHaveInvoice1 } = createInvoice(100, cardVersion)
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionsHaveInvoice2 } = createInvoice(100, cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice1, invoice2],
      cardVersionInvoices: [...cardVersionsHaveInvoice1, ...cardVersionsHaveInvoice2],
    })

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(() => status.toTrpcResponse()).toThrowError(AssertionError)
  })
})
