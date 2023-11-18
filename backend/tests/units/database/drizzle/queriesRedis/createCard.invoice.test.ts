import '../../../mocks/process.env'
import {
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
} from '../mocks/queries'

import { createCard as createCardData, createInvoice } from '../../../../redisData'

import { createCard } from '@backend/database/drizzle/queriesRedis'

describe('createCard', () => {
  it('should create a card with invoice', async () => {
    const card = createCardData()
    card.invoice = createInvoice(100)

    await createCard(card)
    expect(insertCards).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(insertCardVersions).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(insertInvoices).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100,
      paymentHash: card.invoice?.payment_hash,
      paymentRequest: card.invoice?.payment_request,
      created: expect.any(Date),
      paid: null,
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(insertCardVersionInvoices).toHaveBeenCalledWith(expect.objectContaining({
      invoice: card.invoice?.payment_hash,
      cardVersion: expect.any(String),
    }))
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
  })
})
