import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'

import { createCard as createCardData, createLnurlP } from '../../../redisData.js'

import { createCard } from '@backend/database/deprecated/queries.js'

describe('createCard', () => {
  it('should create a card with lnurlp', async () => {
    const card = createCardData()
    card.lnurlp = createLnurlP()

    await createCard(card)
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: card.lnurlp?.id,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(queries.insertOrUpdateInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateCardVersionInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: card.lnurlp?.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
    expect(queries.insertOrUpdateLnurlW).not.toHaveBeenCalled()
  })

  it('should create a card with shared funding', async () => {
    const card = createCardData()
    card.lnurlp = createLnurlP()
    card.lnurlp.shared = true

    await createCard(card)
    expect(queries.insertOrUpdateCard).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: card.lnurlp?.id,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: true,
      landingPageViewed: null,
    }))
    expect(queries.insertOrUpdateInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateCardVersionInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLnurlP).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: card.lnurlp?.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
    expect(queries.insertOrUpdateLnurlW).not.toHaveBeenCalled()
  })
})
