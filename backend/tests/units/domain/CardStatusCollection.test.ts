import { describe, it, expect, beforeAll } from 'vitest'

import { addCard } from '../mocks/domain/CardStatus.js'

import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import { createCard } from '../../drizzleData.js'

const cards = [createCard(), createCard()]

beforeAll(() => {
  addCard(cards[0])
  addCard(cards[1])
})

describe('CardStatusCollection', () => {

  it('should load the statuses multiple cards from cardHash', async () => {
    const statusCollection = await CardStatusCollection.fromCardHashes([cards[0].hash, cards[1].hash])

    expect(statusCollection.cardStatuses).toEqual([
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[0].hash,
        }),
      }),
      expect.objectContaining({
        cardVersion: expect.objectContaining({
          card: cards[1].hash,
        }),
      }),
    ])
  })
})
