import '../../../mocks/process.env'
import { addCardVersions, addInvoices, addCardVersionInvoices, addLnurlPs } from '../mocks/queries'

import { getCardByHash } from '@backend/database/drizzle/queriesRedis'

import { CARD_VERSION_UNFUNDED } from '../data/UnfundedCard'
import {
  CARD_VERSION_FUNDED_LNURLP,
  LNURLP,
  INVOICE,
  CARD_VERSION_INVOICE,
} from '../data/LnurlPFundedCard'
import {
  CARD_VERSION_SHARED_FUNDING, LNURLP_SHARED_FUNDING,
  INVOICE_SHARED_FUNDING_1, INVOICE_SHARED_FUNDING_2,
  CARD_VERSION_INVOICE_SHARED_FUNDING_1, CARD_VERSION_INVOICE_SHARED_FUNDING_2,
} from '../data/LnurlPSharedFunding'
import {
  CARD_VERSION_INVOICE_FUNDING,
  INVOICE_FOR_INVOICE_FUNDING, CARD_VERSION_INVOICE_FOR_INVOICE_FUNDING,
} from '../data/InvoiceFunding'

describe('getCardByHash', () => {
  it('should return null for a card that doesn\'t exist', async () => {
    const card = await getCardByHash('some card hash that doesnt exist')
    expect(card).toBeNull()
  })

  it('should return a card that exists in the database', async () => {
    addCardVersions(CARD_VERSION_UNFUNDED)

    const card = await getCardByHash(CARD_VERSION_UNFUNDED.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_UNFUNDED.card,
      text: CARD_VERSION_UNFUNDED.textForWithdraw,
      note: CARD_VERSION_UNFUNDED.noteForStatusPage,
      invoice: null,
      lnurlp: null,
      setFunding: null,
    }))
  })

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
    }))
  })

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
      }),
      setFunding: null,
    }))
  })

  it('should return a card funded by invoice', async () => {
    addCardVersions(CARD_VERSION_INVOICE_FUNDING)
    addInvoices(INVOICE_FOR_INVOICE_FUNDING)
    addCardVersionInvoices(CARD_VERSION_INVOICE_FOR_INVOICE_FUNDING)

    const card = await getCardByHash(CARD_VERSION_INVOICE_FUNDING.card)
    expect(card).toEqual(expect.objectContaining({
      cardHash: CARD_VERSION_INVOICE_FUNDING.card,
      text: CARD_VERSION_INVOICE_FUNDING.textForWithdraw,
      note: CARD_VERSION_INVOICE_FUNDING.noteForStatusPage,
      invoice: expect.objectContaining({
        amount: INVOICE_FOR_INVOICE_FUNDING.amount,
        payment_hash: INVOICE_FOR_INVOICE_FUNDING.paymentHash,
        payment_request: INVOICE_FOR_INVOICE_FUNDING.paymentRequest,
        created: Math.round(INVOICE_FOR_INVOICE_FUNDING.created.getTime() / 1000),
        paid: INVOICE_FOR_INVOICE_FUNDING.paid != null ? Math.round(INVOICE_FOR_INVOICE_FUNDING.paid.getTime() / 1000) : null,
      }),
      lnurlp: null,
      setFunding: null,
    }))
  })
})
