import { describe, it, expect, beforeEach } from 'vitest'

import '../mocks/process.env'
import '../mocks/axios'
import { addCards } from '../mocks/redis.js'

import { CARD_FUNDED_INVOICE } from '../data/FundedSetWithBulkWithdraw.js'

import NotFoundError from '@backend/errors/NotFoundError.js'
import Card from '@backend/modules/Card.js'

beforeEach(() => {
  addCards(CARD_FUNDED_INVOICE)
})

describe('Card', () => {
  it('should load a card from cardHash', async () => {
    const card = await Card.fromCardHash(CARD_FUNDED_INVOICE.cardHash)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(CARD_FUNDED_INVOICE.cardHash)
    expect(data.invoice).not.toBeNull()
  })

  it('should load a card from cardHash, not default if it exists', async () => {
    const card = await Card.fromCardHashOrDefault(CARD_FUNDED_INVOICE.cardHash)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(CARD_FUNDED_INVOICE.cardHash)
    expect(data.invoice).not.toBeNull()
  })

  it('should load a card that doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    const card = await Card.fromCardHashOrDefault(imaginedCardId)
    const data = await card.toTRpcResponse()
    expect(data.hash).toBe(imaginedCardId)
    expect(data.invoice).toBeNull()
  })

  it('should throw not found if card doesnt exist', async () => {
    const imaginedCardId = 'some random string that doesnt exist'
    await expect(() => Card.fromCardHash(imaginedCardId)).rejects.toThrow(NotFoundError)
  })
})
