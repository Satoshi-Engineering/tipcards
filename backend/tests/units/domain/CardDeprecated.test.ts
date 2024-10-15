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

import NotFoundError from '@backend/errors/NotFoundError.js'
import CardDeprecated from '@backend/domain/CardDeprecated.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
invoice.paid = new Date()
beforeAll(() => {
  addData({
    cards: [card],
    cardVersions: [cardVersion],
    invoices: [invoice],
    cardVersionInvoices: cardVersionsHaveInvoice,
  })
})

describe('Card', () => {
  it('should load a card from cardHash', async () => {
    const cardLocal = await CardDeprecated.fromCardHash(card.hash)
    const data = await cardLocal.toTRpcResponse()
    expect(data.hash).toBe(card.hash)
    expect(data.invoice).not.toBeNull()
  })

  it('should load a card from cardHash, not default if it exists', async () => {
    const cardLocal = await CardDeprecated.fromCardHashOrDefault(card.hash)
    const data = await cardLocal.toTRpcResponse()
    expect(data.hash).toBe(card.hash)
    expect(data.invoice).not.toBeNull()
  })

  it('should load a card that doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    const card = await CardDeprecated.fromCardHashOrDefault(imaginedCardId)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(imaginedCardId)
    expect(data.invoice).toBeNull()
  })

  it('should throw not found if card doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    await expect(() => CardDeprecated.fromCardHash(imaginedCardId)).rejects.toThrow(NotFoundError)
  })
})
