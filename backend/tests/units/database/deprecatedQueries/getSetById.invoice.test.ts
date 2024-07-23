import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createSet,
  createCardForSet, createCardVersion,
  createInvoice,
} from '../../../drizzleData.js'

import { getSetById } from '@backend/database/deprecated/queries.js'

describe('getSetById', () => {
  it('should return a set with invoice', async () => {
    const set = createSet()
    const card1 = createCardForSet(set, 1)
    const cardVersion1 = createCardVersion(card1)
    cardVersion1.textForWithdraw = 'custom text for this test'
    const card2 = createCardForSet(set, 2)
    const cardVersion2 = createCardVersion(card2)
    cardVersion2.textForWithdraw = 'custom text for this test'
    const { invoice, cardVersionsHaveInvoice } = createInvoice(420, cardVersion1, cardVersion2)
    addData({
      sets: [set],
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: cardVersionsHaveInvoice,
    })

    const setRedis = await getSetById(set.id)
    expect(setRedis).toEqual(expect.objectContaining({
      id: set.id,
      settings: null,
      created: expect.any(Number),
      date: expect.any(Number),

      userId: null,

      text: cardVersion1.textForWithdraw,
      note: expect.any(String),
      invoice: expect.objectContaining({
        fundedCards: expect.arrayContaining([1, 2]),
        amount: invoice.amount,
        payment_hash: invoice.paymentHash,
        payment_request: invoice.paymentRequest,
        created: expect.any(Number),
        paid: null,
        expired: false,
      }),
    }))
  })
})
