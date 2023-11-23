import '../../../mocks/process.env'
import {
  addData,
  insertOrUpdateCard,
  insertOrUpdateLatestCardVersion,
  insertOrUpdateInvoice,
  insertOrUpdateCardVersionInvoice,
  insertOrUpdateSet,
  insertOrUpdateSetSettings,
  insertOrUpdateUserCanUseSet,
} from '../mocks/queries'

import {
  createSet as createDrizzleSet,
  createCardForSet,
  createCardVersion,
  createUser,
} from '../../../../drizzleData'
import {
  createSet as createSetData,
  createSetSettings,
  createSetInvoice,
} from '../../../../redisData'

import { updateSet } from '@backend/database/drizzle/queriesRedis'
import { Set } from '@backend/database/redis/data/Set'

describe('updateSet', () => {
  it('should add settings and userId to an existing set', async () => {
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

    const user = createUser()
    const setRedis: Set = createSetData()
    setRedis.id = set.id
    setRedis.settings = createSetSettings()
    setRedis.userId = user.id

    await updateSet(setRedis)
    expect(insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: setRedis.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(insertOrUpdateSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: setRedis.id,
      name: setRedis.settings?.setName,
      numberOfCards: setRedis.settings?.numberOfCards,
      cardHeadline: setRedis.settings?.cardHeadline,
      cardCopytext: setRedis.settings?.cardCopytext,
      image: setRedis.settings?.cardsQrCodeLogo,
      landingPage: setRedis.settings?.landingPage,
    }))
    expect(insertOrUpdateUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      set: setRedis.id,
      canEdit: true,
    }))
  })

  it('should add an invoice to an existing set', async () => {
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

    await updateSet(setRedis)
    expect(insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card1.hash,
      created: expect.any(Date),
      set: set.id,
    }))
    expect(insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card2.hash,
      created: expect.any(Date),
      set: set.id,
    }))
    expect(insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
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
    expect(insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
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
    expect(insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: setRedis.invoice?.amount,
      paymentHash: setRedis.invoice?.payment_hash,
      paymentRequest: setRedis.invoice?.payment_request,
      created: expect.any(Date),
      paid: null,
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: expect.any(String),
      invoice: setRedis.invoice?.payment_hash,
    }))
    expect(insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      cardVersion: expect.any(String),
      invoice: setRedis.invoice?.payment_hash,
    }))
  })
})
