import '../../../mocks/process.env'
import {
  addData,
  deleteSet as deleteDrizzleSet,
  deleteSetSettings,
  updateCard,
  deleteCardVersionInvoice,
  deleteUserCanUseSet,
} from '../mocks/queries'

import {
  createSet as createDrizzleSet,
  createSetSettings,
  createCardForSet,
  createCardVersion,
  createInvoice as createDrizzleInvoice,
  createUser, createUserCanEditSet,
} from '../../../../drizzleData'
import { createSet as createRedisSet } from '../../../../redisData'

import { deleteSet } from '@backend/database/drizzle/queriesRedis'

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
    expect(deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion1.id,
    }))
    expect(deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion2.id,
    }))
    expect(deleteUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      set: set.id,
    }))
    expect(updateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card1.hash,
      set: null,
    }))
    expect(updateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card2.hash,
      set: null,
    }))
    expect(deleteSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: set.id,
    }))
    expect(deleteDrizzleSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
    }))
  })
})
