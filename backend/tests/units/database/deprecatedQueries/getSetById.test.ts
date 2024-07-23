import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createSet, createSetSettings, createUser, createUserCanEditSet } from '../../../drizzleData.js'

import { getSetById } from '@backend/database/deprecated/queries.js'

describe('getSetById', () => {
  it('should return null for an id that doesn\'t exist', async () => {
    const set = await getSetById('some set id that doesnt exist')
    expect(set).toBeNull()
  })

  it('should return a set that exists in the database', async () => {
    const set = createSet()
    addData({
      sets: [set],
    })

    const setRedis = await getSetById(set.id)
    expect(setRedis).toEqual(expect.objectContaining({
      id: set.id,
      settings: null,
      created: expect.any(Number),
      date: expect.any(Number),

      userId: null,

      text: expect.any(String),
      note: expect.any(String),
      invoice: null,
    }))
  })

  it('should return a set with settings', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    setSettings.cardHeadline = 'custom headline'
    addData({
      sets: [set],
      setSettings: [setSettings],
    })

    const setRedis = await getSetById(set.id)
    expect(setRedis).toEqual(expect.objectContaining({
      id: set.id,
      settings: expect.objectContaining({
        setName: setSettings.name,
        numberOfCards: setSettings.numberOfCards,
        cardHeadline: 'custom headline',
      }),
      created: expect.any(Number),
      date: expect.any(Number),

      userId: null,

      text: expect.any(String),
      note: expect.any(String),
      invoice: null,
    }))
  })

  it('should return a set that belongs to a user', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    setSettings.cardHeadline = 'custom headline by user'
    const user = createUser()
    const userCanEditSet = createUserCanEditSet(user, set)
    addData({
      sets: [set],
      setSettings: [setSettings],
      users: [user],
      usersCanUseSets: [userCanEditSet],
    })

    const setRedis = await getSetById(set.id)
    expect(setRedis).toEqual(expect.objectContaining({
      id: set.id,
      settings: expect.objectContaining({
        setName: setSettings.name,
        numberOfCards: setSettings.numberOfCards,
        cardHeadline: 'custom headline by user',
      }),
      created: expect.any(Number),
      date: expect.any(Number),

      userId: user.id,

      text: expect.any(String),
      note: expect.any(String),
      invoice: null,
    }))
  })
})
