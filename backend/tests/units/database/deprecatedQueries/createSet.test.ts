import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createSet as createDrizzleSet,
  createCardForSet,
  createCardVersion,
  createUser,
} from '../../../drizzleData.js'
import {
  createSet as createSetData,
  createSetSettings,
  createSetInvoice,
} from '../../../redisData.js'

import { createSet } from '@backend/database/deprecated/queries.js'
import { Set } from '@backend/database/deprecated/data/Set.js'

describe('createSet', () => {
  it('should create a set with settings and userId', async () => {
    const user = createUser()
    const set: Set = createSetData()
    set.settings = createSetSettings()
    set.userId = user.id

    await createSet(set)
    expect(queries.insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(queries.insertOrUpdateSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: set.id,
      name: set.settings?.setName,
      numberOfCards: set.settings?.numberOfCards,
      cardHeadline: set.settings?.cardHeadline,
      cardCopytext: set.settings?.cardCopytext,
      image: set.settings?.cardsQrCodeLogo,
      landingPage: set.settings?.landingPage,
    }))
    expect(queries.insertOrUpdateUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      set: set.id,
      canEdit: true,
    }))
  })

  it('should create a set with invoice', async () => {
    const set = createDrizzleSet()
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    addData({
      sets: [set],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
    })

    const setRedis: Set = createSetData()
    setRedis.id = set.id
    setRedis.invoice = createSetInvoice([1, 2], 500)

    await createSet(setRedis)
    expect(queries.insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card1.hash,
      created: expect.any(Date),
      set: set.id,
    }))
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card2.hash,
      created: expect.any(Date),
      set: set.id,
    }))
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      card: card1.hash,
      created: expect.any(Date),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: setRedis.text,
      noteForStatusPage: setRedis.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: expect.any(String),
      card: card2.hash,
      created: expect.any(Date),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: setRedis.text,
      noteForStatusPage: setRedis.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: setRedis.invoice?.amount,
      paymentHash: setRedis.invoice?.payment_hash,
      paymentRequest: setRedis.invoice?.payment_request,
      created: expect.any(Date),
      paid: null,
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: expect.any(String),
      invoice: setRedis.invoice?.payment_hash,
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: expect.any(String),
      invoice: setRedis.invoice?.payment_hash,
    }))
  })
})
