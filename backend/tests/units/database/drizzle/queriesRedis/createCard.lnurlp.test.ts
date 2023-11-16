import '../../../mocks/process.env'
import {
  insertCards, insertCardVersions,
  insertInvoices, insertCardVersionInvoices,
  insertLnurlPs, insertLnurlWs,
} from '../mocks/queries'

import { createCard as createCardData, createLnurlP } from '../../../../redisData'

import { createCard } from '@backend/database/drizzle/queriesRedis'

describe('createCard', () => {
  it('should create a card with lnurlp', async () => {
    const card = createCardData()
    card.lnurlp = createLnurlP()

    await createCard(card)
    expect(insertCards).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(insertCardVersions).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: card.lnurlp?.id,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: false,
      landingPageViewed: null,
    }))
    expect(insertInvoices).toHaveBeenCalledWith()
    expect(insertCardVersionInvoices).toHaveBeenCalledWith()
    expect(insertLnurlPs).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: card.lnurlp?.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
    expect(insertLnurlWs).not.toHaveBeenCalled()
  })

  it('should create a card with shared funding', async () => {
    const card = createCardData()
    card.lnurlp = createLnurlP()
    card.lnurlp.shared = true

    await createCard(card)
    expect(insertCards).toHaveBeenCalledWith(expect.objectContaining({
      hash: card.cardHash,
      created: expect.any(Date),
    }))
    expect(insertCardVersions).toHaveBeenCalledWith(expect.objectContaining({
      card: card.cardHash,
      created: expect.any(Date),
      lnurlP: card.lnurlp?.id,
      lnurlW: null,
      textForWithdraw: card.text,
      noteForStatusPage: card.note,
      sharedFunding: true,
      landingPageViewed: null,
    }))
    expect(insertInvoices).toHaveBeenCalledWith()
    expect(insertCardVersionInvoices).toHaveBeenCalledWith()
    expect(insertLnurlPs).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: card.lnurlp?.id,
      created: expect.any(Date),
      expiresAt: null,
      finished: null,
    }))
    expect(insertLnurlWs).not.toHaveBeenCalled()
  })
})
