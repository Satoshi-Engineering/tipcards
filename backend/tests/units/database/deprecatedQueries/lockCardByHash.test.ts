import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../mocks/client.js'
import { lockCardByHash } from '@backend/database/deprecated/queries.js'
import { createCard } from '../../../drizzleData.js'
import { addCards } from '../mocks/database.js'

describe('lockCardByHash', () => {
  it('should lock card by hash', async () => {
    const card = createCard()
    addCards(card)

    const lockValue = await lockCardByHash(card.hash)
    expect(lockValue).not.toBeNull()
  })

  it('should lock card, even if the card does not exist', async () => {
    const randomCardHash = createCard().hash
    const lockValue = await lockCardByHash(randomCardHash)
    expect(lockValue).not.toBeNull()
  })

  it('should not lock card, because it has been already locked', async () => {
    const card = createCard()
    addCards(card)

    const lockValue = await lockCardByHash(card.hash)
    expect(lockValue).not.toBeNull()

    const secondLockValue = await lockCardByHash(card.hash)
    expect(secondLockValue).toBeNull()
  })
})
