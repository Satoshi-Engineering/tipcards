import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices, addLnurlPs } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import {
  CARD_VERSION_FUNDED_LNURLP,
  LNURLP,
  INVOICE,
  CARD_VERSION_INVOICE,
} from '../data/LnurlPFundedCard'

describe('getCardByHash lnurlp funding', () => {
  it('should return a card funded by lnurlp', async () => {
    addCardVersions(CARD_VERSION_FUNDED_LNURLP)
    addLnurlPs(LNURLP)
    addInvoices(INVOICE)
    addCardVersionInvoices(CARD_VERSION_INVOICE)

    const card = await getCardByHash(CARD_VERSION_FUNDED_LNURLP.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_FUNDED_LNURLP.card,
      text: CARD_VERSION_FUNDED_LNURLP.textForWithdraw,
      note: CARD_VERSION_FUNDED_LNURLP.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 100,
        payment_hash: expect.arrayContaining([INVOICE.paymentHash]),
        shared: CARD_VERSION_FUNDED_LNURLP.sharedFunding,
      }),
      setFunding: null,
      lnbitsWithdrawId: null,
    }))
  })
})
