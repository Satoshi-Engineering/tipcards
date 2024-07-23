import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'

import { createCard as createCardData } from '../../../redisData.js'

import { createCard } from '@backend/database/deprecated/queries.js'

describe('createCard', () => {
  it('should create a blank card', async () => {
    const card = createCardData()

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
    expect(queries.insertOrUpdateInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateCardVersionInvoice).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLnurlP).not.toHaveBeenCalled()
    expect(queries.insertOrUpdateLnurlW).not.toHaveBeenCalled()
  })
})
