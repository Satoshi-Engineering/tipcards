import '../../../mocks/process.env'
import {
  createCards, createCardVerions,
  createInvoices, createCardVersionInvoices,
  createLnurlPs, createLnurlWs,
} from '../mocks/queries'

import { createCard as createCardData } from '../../../../redisData'

import { createCard } from '@backend/database/drizzle/queriesRedis'

describe('createCard', () => {
  it('should create a blank card', async () => {
    const card = createCardData()

    await createCard(card)
    expect(createCards).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(createCardVerions).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: null,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(createInvoices).not.toHaveBeenCalled()
    expect(createCardVersionInvoices).not.toHaveBeenCalled()
    expect(createLnurlPs).not.toHaveBeenCalled()
    expect(createLnurlWs).not.toHaveBeenCalled()
  })
})
