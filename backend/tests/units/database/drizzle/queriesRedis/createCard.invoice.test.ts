import '../../../mocks/process.env'
import {
  insertCards, insertCardVerions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
} from '../mocks/queries'

import { createCard as createCardData, createInvoice } from '../../../../redisData'

import { createCard } from '@backend/database/drizzle/queriesRedis'

describe('createCard', () => {
  it('should create a blank card', async () => {
    const card = createCardData()
    const invoice = createInvoice(100)
    card.invoice = invoice

    await createCard(card)
    expect(insertCards).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(insertCardVerions).toHaveBeenCalledWith(expect.objectContaining({
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
      paymentHash: invoice?.payment_hash,
      paymentRequest: invoice?.payment_request,
      created: expect.any(Date),
      paid: null,
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(insertCardVersionInvoices).toHaveBeenCalledTimes(1)
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
  })
})
