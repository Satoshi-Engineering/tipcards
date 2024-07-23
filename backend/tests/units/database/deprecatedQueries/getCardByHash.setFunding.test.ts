import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice } from '../../../drizzleData.js'

import { getCardByHash } from '@backend/database/deprecated/queries.js'

describe('getCardByHash', () => {
  it('should return a set funded card', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(500, cardVersion1, cardVersion2)
    invoice.paid = new Date()
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const cardRedis = await getCardByHash(card1.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card1.hash,
      text: cardVersion1.textForWithdraw,
      note: cardVersion1.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: expect.objectContaining({
        amount: 250,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
