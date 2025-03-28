import { beforeAll, describe, expect, it } from 'vitest'

import '../mocks/database/client.js'
import { createSet, createSetSettings, createCardForSet } from '../../drizzleData.js'
import { addData } from '../mocks/database/database.js'

import SetCollection from '@backend/domain/SetCollection.js'
import { Set } from '@backend/database/schema/Set.js'
import { SetSettings } from '@backend/database/schema/SetSettings.js'
import { SetDto } from '@shared/data/trpc/SetDto.js'

const sets = [
  createSet(),
  createSet(),
  createSet(),
  createSet(),
]
const setSettings = [
  createSetSettings(sets[0]),
  createSetSettings(sets[1]),
  createSetSettings(sets[2]),
  createSetSettings(sets[3]),
]
const usersCanUseSets = [
  { user: 'userId', set: sets[0].id, canEdit: true },
  { user: 'userId', set: sets[1].id, canEdit: true },
  { user: 'userId', set: sets[2].id, canEdit: true },
  { user: 'differentUserId', set: sets[3].id, canEdit: true },
]

describe('Set', () => {
  beforeAll(() => {
    addData({
      sets,
      setSettings,
      usersCanUseSets,
    })
  })

  it('should load all sets for a user', async () => {
    const setsWithSettings = await SetCollection.fromUserId('userId')

    expect(setsWithSettings.toTRpcResponse()).toEqual([
      getSetWithSettings(sets[0], setSettings[0]),
      getSetWithSettings(sets[1], setSettings[1]),
      getSetWithSettings(sets[2], setSettings[2]),
    ])
    expect(setsWithSettings.toTRpcResponse()).not.toContain(
      getSetWithSettings(sets[3], setSettings[3]),
    )
  })

  it('should return all cardHashes for all sets', async () => {
    const setsWithSettings = await SetCollection.fromUserId('userId')
    const cardHashes = setsWithSettings.getAllCardHashes()

    expect(cardHashes).toEqual(expect.arrayContaining([
      ...new Array(setSettings[0].numberOfCards).fill(0).map((_, index) => createCardForSet(sets[0], index).hash),
      ...new Array(setSettings[1].numberOfCards).fill(0).map((_, index) => createCardForSet(sets[1], index).hash),
      ...new Array(setSettings[2].numberOfCards).fill(0).map((_, index) => createCardForSet(sets[2], index).hash),
    ]))

    expect(cardHashes).not.toContain(expect.arrayContaining([
      ...new Array(setSettings[3].numberOfCards).fill(0).map((_, index) => createCardForSet(sets[3], index).hash),
    ]))
  })
})

const getSetWithSettings = (set: Set, setSettings: SetSettings) => SetDto.parse({
  ...set,
  settings: {
    ...setSettings,
  },
})
