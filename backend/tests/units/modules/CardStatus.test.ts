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

import CardStatus from '@backend/modules/CardStatus.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatus.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)

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
    cards: [card, setCard1, setCard2],
    cardVersions: [cardVersion, setCardVersion1, setCardVersion2],
    invoices: [invoice, setInvoice],
    cardVersionInvoices: [...cardVersionsHaveInvoice, ...setCardVersionsHaveInvoice],
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

  it('should load the status of a card funded by set funding', async () => {
    const status = await CardStatus.latestFromCardHashOrDefault(setCard1.hash)
    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.setInvoiceFunding,
      amount: 50,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })
})
