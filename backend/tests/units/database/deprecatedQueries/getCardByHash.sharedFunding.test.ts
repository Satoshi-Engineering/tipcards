import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { createCard, createCardVersion, createInvoice, createLnurlP, createLnurlW } from '../../../drizzleData.js'

import { getCardByHash } from '@backend/database/deprecated/queries.js'

describe('getCardByHash', () => {
  it('should return a card funded by lnurlp shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlp = createLnurlP(cardVersion)
    cardVersion.sharedFunding = true
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionHasInvoice1 } = createInvoice(300, cardVersion)
    invoice1.paid = new Date()
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionHasInvoice2 } = createInvoice(600, cardVersion)
    invoice2.paid = new Date()
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice1, invoice2],
      cardVersionInvoices: [...cardVersionHasInvoice1, ...cardVersionHasInvoice2],
      lnurlps: [lnurlp],
    })

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 900,
        payment_hash: expect.arrayContaining([invoice1.paymentHash, invoice2.paymentHash]),
        shared: true,
        paid: null,
      }),
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })

  it('should set paid for shared funding when a withdraw link exists', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlp = createLnurlP(cardVersion)
    cardVersion.sharedFunding = true
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionHasInvoice1 } = createInvoice(400, cardVersion)
    invoice1.paid = new Date()
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionHasInvoice2 } = createInvoice(800, cardVersion)
    invoice2.paid = new Date()
    lnurlp.finished = new Date()
    const lnurlw = createLnurlW(cardVersion)
    cardVersion.landingPageViewed = new Date()
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice1, invoice2],
      cardVersionInvoices: [...cardVersionHasInvoice1, ...cardVersionHasInvoice2],
      lnurlps: [lnurlp],
      lnurlws: [lnurlw],
    })

    const cardRedis = await getCardByHash(card.hash)
    expect(cardRedis).toEqual(expect.objectContaining({
      cardHash: card.hash,
      text: cardVersion.textForWithdraw,
      note: cardVersion.noteForStatusPage,
      invoice: null,
      lnurlp: expect.objectContaining({
        amount: 1200,
        payment_hash: expect.arrayContaining([invoice1.paymentHash, invoice2.paymentHash]),
        shared: true,
        paid: expect.any(Number),
      }),
      setFunding: null,
      lnbitsWithdrawId: lnurlw.lnbitsId,
      landingPageViewed: expect.any(Number),
      isLockedByBulkWithdraw: false,
      used: null,
    }))
  })
})
