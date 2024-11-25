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
    const cardsSummary = await setWithSettings.getCardsSummary()

    expect(cardsSummary).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: defaultNumberOfCards, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 0, amount: 0 },
    })
  })
})
