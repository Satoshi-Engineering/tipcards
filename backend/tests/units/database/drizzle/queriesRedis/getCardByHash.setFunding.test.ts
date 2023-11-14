import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import {
  CARD_VERSION_SET_FUNDING_1, CARD_VERSION_SET_FUNDING_2,
  INVOICE_FOR_SET_FUNDING,
  CARD_VERSION_INVOICE_FOR_SET_FUNDING_1, CARD_VERSION_INVOICE_FOR_SET_FUNDING_2,
} from '../data/SetFunding'

describe('getCardByHash', () => {
  it('should return a set funded card', async () => {
    addCardVersions(CARD_VERSION_SET_FUNDING_1, CARD_VERSION_SET_FUNDING_2)
    addInvoices(INVOICE_FOR_SET_FUNDING)
    addCardVersionInvoices(CARD_VERSION_INVOICE_FOR_SET_FUNDING_1, CARD_VERSION_INVOICE_FOR_SET_FUNDING_2)

    const card = await getCardByHash(CARD_VERSION_SET_FUNDING_1.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_SET_FUNDING_1.card,
      text: CARD_VERSION_SET_FUNDING_1.textForWithdraw,
      note: CARD_VERSION_SET_FUNDING_1.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: expect.objectContaining({
        amount: INVOICE_FOR_SET_FUNDING.amount / 2,
        created: expect.any(Number),
        paid: expect.any(Number),
      }),
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
