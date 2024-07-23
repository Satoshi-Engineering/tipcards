import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createSet as createDrizzleSet,
  createSetSettings,
  createCardForSet,
  createCardVersion,
  createInvoice as createDrizzleInvoice,
  createUser, createUserCanEditSet,
} from '../../../drizzleData.js'
import { createSet as createRedisSet } from '../../../redisData.js'

import { deleteSet } from '@backend/database/deprecated/queries.js'

describe('deleteSet', () => {
  it('should delete a set, including invoice and userCanUseSet', async () => {
    const set = createDrizzleSet()
    const setSettings = createSetSettings(set)
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createDrizzleInvoice(500, cardVersion1, cardVersion2)
    const user = createUser()
    const userCanEditSet = createUserCanEditSet(user, set)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
      users: [user],
      usersCanUseSets: [userCanEditSet],
    })

    const setRedis = createRedisSet()
    setRedis.id = set.id
    await deleteSet(setRedis)
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion1.id,
    }))
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion2.id,
    }))
    expect(queries.deleteUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      set: set.id,
    }))
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card1.hash,
      set: null,
    }))
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card2.hash,
      set: null,
    }))
    expect(queries.deleteSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: set.id,
    }))
    expect(queries.deleteSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
    }))
  })
})
