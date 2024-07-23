import { describe, it, expect } from 'vitest'

import assert from 'assert'
import '../../mocks/process.env.js'
import '../mocks/client.js'
import { lockCardByHash, releaseCardByHash } from '@backend/database/deprecated/queries.js'
import { createCard } from '../../../drizzleData.js'
import { addCards } from '../mocks/database.js'

describe('releaseCardByHash', () => {
  it('should release card by hash, which was locked', async () => {
    const card = createCard()
    addCards(card)

    const lockValue = await lockCardByHash(card.hash)
    assert(lockValue != null)

    await expect(releaseCardByHash(card.hash, lockValue)).resolves.toBeUndefined()
  })

  it('should not release card, because the card does not exist', async () => {
    const randomCardHash = createCard().hash
    await expect(releaseCardByHash(randomCardHash, 'randomLockValue')).rejects.toThrow()
  })

  it('should not release card, because the card is not locked', async () => {
    const card = createCard()
    addCards(card)
    await expect(releaseCardByHash(card.hash, 'randomLockValue')).rejects.toThrow()
  })

  it('should not release card, because the card was locked with a different lockValue', async () => {
    const card = createCard()
    addCards(card)

    const lockValue = await lockCardByHash(card.hash)
    assert(lockValue != null)

    await expect(releaseCardByHash(card.hash, `${lockValue}DIFFERENTLOCKVALUE`)).rejects.toThrow()
  })

  it('should not release card, because it has been already released', async () => {
    const card = createCard()
    addCards(card)

    const lockValue = await lockCardByHash(card.hash)
    assert(lockValue != null)

    await releaseCardByHash(card.hash, lockValue)
    await expect(releaseCardByHash(card.hash, lockValue)).rejects.toThrow()
  })
})
