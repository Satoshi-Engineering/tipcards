import { beforeAll, describe, expect, it } from 'vitest'

import '../mocks/database/client.js'
import { createSet, createSetSettings } from '../../drizzleData.js'
import { addData } from '../mocks/database/database.js'

import Set from '@backend/domain/Set.js'
import hashSha256 from '@backend/services/hashSha256.js'
import { defaultNumberOfCards } from '@shared/data/trpc/SetSettingsDto.js'
import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto.js'

const set = createSet()
const setSettings = createSetSettings(set)

describe('Set', () => {
  beforeAll(() => {
    addData({
      sets: [set],
      setSettings: [setSettings],
    })
  })

  it('should load a set with its setSettings based on a setId', async () => {
    const setWithSettings = await Set.fromId(set.id)

    expect(setWithSettings.set).toEqual({
      ...set,
      settings: {
        ...setSettings,
        set: undefined,
      },
    })
  })

  it('should return a cardHash for a set based on the card index', async () => {
    const setWithSettings = await Set.fromId(set.id)
    const cardHash = setWithSettings.getCardHash(0)

    expect(cardHash).toEqual(hashSha256(`${set.id}/0`))
  })

  it('should return all cardHashes for a set', async () => {
    const setWithSettings = await Set.fromId(set.id)
    const cardHashes = setWithSettings.getAllCardHashes()

    expect(cardHashes).toEqual(
      Array.from({ length: defaultNumberOfCards }, (_, i) => hashSha256(`${set.id}/${i}`)),
    )
  })

  it('should return a CardsSummary for a set', async () => {
    const setWithSettings = await Set.fromId(set.id)
    const cardStatusCollection = await setWithSettings.getCardStatusCollection()
    const cardsSummaryDto = cardStatusCollection.summary.toTRpcResponse()

    expect(cardsSummaryDto).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: defaultNumberOfCards, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 0, amount: 0 },
    })
  })

  it('should clone a set with a new name', async () => {
    const userId = 'test-user-id'
    const newName = 'Cloned Set Name'

    const clonedSet = await Set.clone(set.id, newName, userId)

    // Verify the cloned set has a different ID
    expect(clonedSet.set.id).not.toEqual(set.id)

    // Verify the cloned set has the new name
    expect(clonedSet.set.settings.name).toEqual(newName)

    // Verify all other settings were copied
    expect(clonedSet.set.settings.numberOfCards).toEqual(setSettings.numberOfCards)
    expect(clonedSet.set.settings.cardHeadline).toEqual(setSettings.cardHeadline)
    expect(clonedSet.set.settings.cardCopytext).toEqual(setSettings.cardCopytext)
    expect(clonedSet.set.settings.image).toEqual(setSettings.image)
    expect(clonedSet.set.settings.landingPage).toEqual(setSettings.landingPage)

    // Verify the cloned set has new timestamps
    expect(clonedSet.set.created).toBeInstanceOf(Date)
    expect(clonedSet.set.changed).toBeInstanceOf(Date)
  })

  it('should generate unique card hashes for cloned set', async () => {
    const userId = 'test-user-id'
    const newName = 'Another Cloned Set'

    const originalSet = await Set.fromId(set.id)
    const originalCardHashes = originalSet.getAllCardHashes()

    const clonedSet = await Set.clone(set.id, newName, userId)
    const clonedCardHashes = clonedSet.getAllCardHashes()

    // Verify same number of cards
    expect(clonedCardHashes).toHaveLength(originalCardHashes.length)

    // Verify all hashes are different (because set ID is different)
    clonedCardHashes.forEach((clonedHash, index) => {
      expect(clonedHash).not.toEqual(originalCardHashes[index])
    })
  })
})
