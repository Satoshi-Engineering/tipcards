import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createSet as createDrizzleSet,
  createCardForSet,
  createCardVersion,
  createInvoice as createDrizzleInvoice,
  createUser,
} from '../../../drizzleData.js'
import {
  createSet as createSetData,
  createSetSettings,
  createSetInvoice,
} from '../../../redisData.js'

import { updateSet } from '@backend/database/deprecated/queries.js'
import { Set } from '@backend/database/deprecated/data/Set.js'

describe('updateSet', () => {
  it('should add settings and userId to an existing set', async () => {
    const set = createDrizzleSet()
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    const user = createUser()
    addData({
      sets: [set],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      users: [user],
    })

    const setRedis: Set = createSetData()
    setRedis.id = set.id
    setRedis.settings = createSetSettings()
    setRedis.userId = user.id

    await updateSet(setRedis)
    expect(queries.insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: setRedis.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(queries.insertOrUpdateSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: setRedis.id,
      name: setRedis.settings?.setName,
      numberOfCards: setRedis.settings?.numberOfCards,
      cardHeadline: setRedis.settings?.cardHeadline,
      cardCopytext: setRedis.settings?.cardCopytext,
      image: setRedis.settings?.cardsQrCodeLogo,
      landingPage: setRedis.settings?.landingPage,
    }))
    expect(queries.insertOrUpdateUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
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

  it('should mark an invoice as paid for an existing set', async () => {
    const set = createDrizzleSet()
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createDrizzleInvoice(500, cardVersion1, cardVersion2)
    const user = createUser()
    addData({
      sets: [set],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
      users: [user],
    })

    const setRedis: Set = createSetData()
    setRedis.id = set.id
    setRedis.invoice = createSetInvoice([1, 2], 500, Math.round(+ new Date() / 1000))

    await updateSet(setRedis)
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
      paid: expect.any(Date),
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

  it('should remove an invoice from an existing set', async () => {
    const set = createDrizzleSet()
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createDrizzleInvoice(500, cardVersion1, cardVersion2)
    const user = createUser()
    addData({
      sets: [set],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
      users: [user],
    })

    const setRedis: Set = createSetData()
    setRedis.id = set.id
    setRedis.userId = user.id
    setRedis.invoice = null

    await updateSet(setRedis)
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion1.id,
    }))
    expect(queries.deleteCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: invoice.paymentHash,
      cardVersion: cardVersion2.id,
    }))
  })
})
