import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices, addLnurlPs, addLnurlWs } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import {
  CARD_VERSION_SHARED_FUNDING, LNURLP_SHARED_FUNDING,
  INVOICE_SHARED_FUNDING_1, INVOICE_SHARED_FUNDING_2,
  CARD_VERSION_INVOICE_SHARED_FUNDING_1, CARD_VERSION_INVOICE_SHARED_FUNDING_2,
} from '../data/LnurlPSharedFunding'
import {
  CARD_VERSION_SHARED_FUNDING_FINISHED, LNURLP_SHARED_FUNDING_FINISHED,
  INVOICE_SHARED_FUNDING_FINISHED_1, INVOICE_SHARED_FUNDING_FINISHED_2,
  CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_1, CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_2,
  LNURL_W_SHARED_FUNDING_FINISHED,
} from '../data/LnurlPSharedFundingFinished'

describe('getCardByHash shared funding', () => {
  it('should return a card funded by lnurlp shared funding', async () => {
    addCardVersions(CARD_VERSION_SHARED_FUNDING)
    addLnurlPs(LNURLP_SHARED_FUNDING)
    addInvoices(INVOICE_SHARED_FUNDING_1, INVOICE_SHARED_FUNDING_2)
    addCardVersionInvoices(CARD_VERSION_INVOICE_SHARED_FUNDING_1, CARD_VERSION_INVOICE_SHARED_FUNDING_2)

    const card = await getCardByHash(CARD_VERSION_SHARED_FUNDING.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_SHARED_FUNDING.card,
      text: CARD_VERSION_SHARED_FUNDING.textForWithdraw,
      note: CARD_VERSION_SHARED_FUNDING.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: INVOICE_SHARED_FUNDING_1.amount + INVOICE_SHARED_FUNDING_2.amount,
        payment_hash: expect.arrayContaining([INVOICE_SHARED_FUNDING_1.paymentHash, INVOICE_SHARED_FUNDING_2.paymentHash]),
        shared: CARD_VERSION_SHARED_FUNDING.sharedFunding,
        paid: null,
      }),
      setFunding: null,
      lnbitsWithdrawId: null,
    }))
  })

  it('should set paid for shared funding when a withdraw link exists', async () => {
    addCardVersions(CARD_VERSION_SHARED_FUNDING_FINISHED)
    addLnurlPs(LNURLP_SHARED_FUNDING_FINISHED)
    addInvoices(INVOICE_SHARED_FUNDING_FINISHED_1, INVOICE_SHARED_FUNDING_FINISHED_2)
    addCardVersionInvoices(CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_1, CARD_VERSION_INVOICE_SHARED_FUNDING_FINISHED_2)
    addLnurlWs(LNURL_W_SHARED_FUNDING_FINISHED)

    const card = await getCardByHash(CARD_VERSION_SHARED_FUNDING_FINISHED.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_SHARED_FUNDING_FINISHED.card,
      text: CARD_VERSION_SHARED_FUNDING_FINISHED.textForWithdraw,
      note: CARD_VERSION_SHARED_FUNDING_FINISHED.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: INVOICE_SHARED_FUNDING_FINISHED_1.amount + INVOICE_SHARED_FUNDING_FINISHED_2.amount,
        payment_hash: expect.arrayContaining([INVOICE_SHARED_FUNDING_FINISHED_1.paymentHash, INVOICE_SHARED_FUNDING_FINISHED_2.paymentHash]),
        shared: CARD_VERSION_SHARED_FUNDING_FINISHED.sharedFunding,
        paid: expect.any(Number),
      }),
      setFunding: null,
      lnbitsWithdrawId: LNURL_W_SHARED_FUNDING_FINISHED.lnbitsId,
    }))
  })
})
