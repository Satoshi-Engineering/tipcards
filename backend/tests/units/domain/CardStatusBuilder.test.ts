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
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import CardStatus from '@backend/domain/CardStatus.js'
import CardStatusBuilder from '@backend/domain/CardStatusBuilder.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)

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
})
