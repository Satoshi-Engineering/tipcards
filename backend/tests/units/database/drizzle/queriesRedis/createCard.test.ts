import '../../../mocks/process.env'
import {
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
} from '../mocks/queries'

import { createCard as createCardData } from '../../../../redisData'

import { createCard } from '@backend/database/drizzle/queriesRedis'

describe('createCard', () => {
  it('should create a blank card', async () => {
    const card = createCardData()

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
    expect(insertInvoices).not.toHaveBeenCalled()
    expect(insertCardVersionInvoices).not.toHaveBeenCalled()
    expect(insertLnurlPs).not.toHaveBeenCalled()
    expect(insertLnurlWs).not.toHaveBeenCalled()
  })
})
