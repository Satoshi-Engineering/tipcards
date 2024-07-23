import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createSet, createSetSettings, createUser, createUserCanEditSet } from '../../../drizzleData.js'

import { getSetsByUserId } from '@backend/database/deprecated/queries.js'

describe('getSetsByUserId', () => {
  it('should return an empty array if the user doesnt exist', async () => {
    const sets = await getSetsByUserId('some user id that doesnt exist')
    expect(sets).toEqual([])
  })

  it('should return a list of sets that the user can access', async () => {
    const set1 = createSet()
    const setSettings1 = createSetSettings(set1)
    setSettings1.cardHeadline = 'custom headline by user'
    const set2 = createSet()
    const user = createUser()
    const userCanEditSet1 = createUserCanEditSet(user, set1)
    const userCanEditSet2 = createUserCanEditSet(user, set2)
    addData({
      sets: [set1, set2],
      setSettings: [setSettings1],
      users: [user],
      usersCanUseSets: [userCanEditSet1, userCanEditSet2],
    })

    const setsRedis = await getSetsByUserId(user.id)
    expect(setsRedis).toEqual(expect.arrayContaining([expect.objectContaining({
      id: set1.id,
      settings: expect.objectContaining({
        setName: setSettings1.name,
        numberOfCards: setSettings1.numberOfCards,
        cardHeadline: 'custom headline by user',
      }),
      created: expect.any(Number),
      date: expect.any(Number),

      userId: user.id,

      text: expect.any(String),
      note: expect.any(String),
      invoice: null,
    }), expect.objectContaining({
      id: set2.id,
      settings: null,
      created: expect.any(Number),
      date: expect.any(Number),

      userId: user.id,

      text: expect.any(String),
      note: expect.any(String),
      invoice: null,
    })]))
  })
})
