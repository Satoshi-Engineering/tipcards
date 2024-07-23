import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'

import { createCard as createCardData, createInvoice } from '../../../redisData.js'

import { createCard } from '@backend/database/deprecated/queries.js'

describe('createCard', () => {
  it('should create a card with invoice', async () => {
    const card = createCardData()
    card.invoice = createInvoice(100)

    await createCard(card)
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(queries.insertOrUpdateInvoice).toHaveBeenCalledWith(expect.objectContaining({
      amount: 100,
      paymentHash: card.invoice?.payment_hash,
      paymentRequest: card.invoice?.payment_request,
      created: expect.any(Date),
      paid: null,
      expiresAt: expect.any(Date),
      extra: expect.any(String),
    }))
    expect(queries.insertOrUpdateCardVersionInvoice).toHaveBeenCalledWith(expect.objectContaining({
      invoice: card.invoice?.payment_hash,
      cardVersion: expect.any(String),
    }))
    expect(queries.insertOrUpdateLnurlP).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLnurlW).not.toHaveBeenCalled()
  })
})
