import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice, createLnurlW } from '../../../drizzleData.js'

import { getCardByHash } from '@backend/database/deprecated/queries.js'

describe('getCardByHash', () => {
  it('should set isLockedByBulkWithdraw when a lnurlw exists for multiple cards', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionHasInvoice1 } = createInvoice(100, cardVersion1)
    cardVersion1.landingPageViewed = new Date()
    invoice1.paid = new Date()
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionHasInvoice2 } = createInvoice(200, cardVersion2)
    invoice2.paid = new Date()
    const lnurlw = createLnurlW(cardVersion1, cardVersion2)
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice1, invoice2],
      cardVersionInvoices: [...cardVersionHasInvoice1, ...cardVersionHasInvoice2],
      lnurlws: [lnurlw],
    })

    const card = await getCardByHash(card1.hash)
    expect(card).toEqual(expect.objectContaining({
      cardHash: card1.hash,
      text: cardVersion1.textForWithdraw,
      note: cardVersion1.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: invoice1.amount,
        payment_hash: invoice1.paymentHash,
        payment_request: invoice1.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: true,
      used: null,
    }))
  })
})
