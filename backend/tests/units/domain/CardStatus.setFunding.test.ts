import { describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
} from '../../drizzleData.js'

import CardStatus from '@backend/domain/CardStatus.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

const setCard1 = createCard()
const setCardVersion1 = createCardVersion(setCard1)
const setCard2 = createCard()
const setCardVersion2 = createCardVersion(setCard2)
const {
  invoice: setInvoice,
  cardVersionsHaveInvoice: setCardVersionsHaveInvoice,
} = createInvoice(100, setCardVersion1, setCardVersion2)

beforeAll(() => {
  addData({
    cards: [setCard1, setCard2],
    cardVersions: [setCardVersion1, setCardVersion2],
    invoices: [setInvoice],
    cardVersionInvoices: [...setCardVersionsHaveInvoice],
  })
})

describe('Card', () => {
  it('should load the status of a card with set funding invoice', async () => {
    const status = await CardStatus.latestFromCardHashOrDefault(setCard1.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.setInvoiceFunding,
      amount: 50,
      created: setCardVersion1.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle an expired set funding invoice', async () => {
    setInvoice.expiresAt = new Date(0)

    const status = await CardStatus.latestFromCardHashOrDefault(setCard1.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.setInvoiceExpired,
      amount: 50,
      created: setCardVersion1.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a card funded by set funding invoice', async () => {
    setInvoice.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    setInvoice.paid = new Date(1230980400000)

    const status = await CardStatus.latestFromCardHashOrDefault(setCard1.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.funded,
      amount: 50,
      created: setCardVersion1.created,
      funded: setInvoice.paid,
      withdrawn: null,
    }))
  })
})
