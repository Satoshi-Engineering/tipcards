import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice, createLnurlW } from '../../../drizzleData.js'

import { getCardByHash } from '@backend/database/deprecated/queries.js'

describe('getCardByHash', () => {
  it('should set the used flag when the lnurlw is withdrawn', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(200, cardVersion)
    invoice.paid = new Date()
    const lnurlw = createLnurlW(cardVersion)
    cardVersion.landingPageViewed = new Date()
    lnurlw.withdrawn = new Date()
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlw],
    })

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: invoice.amount,
        payment_hash: invoice.paymentHash,
        payment_request: invoice.paymentRequest,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: lnurlw.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: false,
      used: expect.any(Number),
    }))
  })
})
