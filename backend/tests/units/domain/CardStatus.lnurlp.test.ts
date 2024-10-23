import { describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createLnurlP,
  createInvoice,
} from '../../drizzleData.js'

import CardStatus from '@backend/domain/CardStatus.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const lnurlp = createLnurlP(cardVersion)

beforeAll(() => {
  addData({
    cards: [card],
    cardVersions: [cardVersion],
    lnurlps: [lnurlp],
  })
})

describe('Card', () => {
  it('should load the status of a card from cardHash', async () => {
    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpFunding,
      amount: 0,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle expired lnurlp', async () => {
    lnurlp.expiresAt = new Date(0)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpExpired,
      amount: 0,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a card funded by shared funding', async () => {
    cardVersion.sharedFunding = true
    lnurlp.expiresAt = null

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedFunding,
      amount: 0,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle expired lnurlp shared funding', async () => {
    lnurlp.expiresAt = new Date(0)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    addData({
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
    })

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
      amount: 0,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle expired lnurlp shared funding with funds on it', async () => {
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    addData({
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
    })
    invoice.paid = new Date(1230980400000)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedExpiredFunded,
      amount: 100,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load status of a finished lnurlp funding', async () => {
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    addData({
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
    })
    invoice.paid = new Date(1230980400000)
    lnurlp.finished = new Date(1230980400000)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 200,
      created: cardVersion.created,
      funded: lnurlp.finished,
      withdrawn: null,
    }))
  })
})
