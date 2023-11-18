import { randomUUID } from 'crypto'

import '../../../mocks/process.env'
import {
  addData,
  updateCardVesion,
  insertOrUpdateLnurlW,
} from '../mocks/queries'

import { updateCard } from '@backend/database/drizzle/queriesRedis'
import hashSha256 from '@backend/services/hashSha256'

import { createCard, createCardVersion, createInvoice, createLnurlW } from '../../../../drizzleData'
import { createCard as createRedisCard, createInvoice as createRedisInvoice } from '../../../../redisData'


describe('updateCard', () => {
  it('should create a lnurlw', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date()
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    const invoiceRedis = createRedisInvoice(100)
    invoiceRedis.payment_hash = invoice.paymentHash
    invoiceRedis.payment_request = invoice.paymentRequest
    invoiceRedis.paid = Math.round(+ new Date() / 1000)
    cardRedis.invoice = invoiceRedis
    cardRedis.lnbitsWithdrawId = hashSha256(randomUUID())

    await updateCard(cardRedis)
    expect(updateCardVesion).toHaveBeenCalledWith(expect.objectContaining({
      lnurlW: cardRedis.lnbitsWithdrawId,
    }))
    expect(insertOrUpdateLnurlW).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnbitsWithdrawId,
      created: expect.any(Date),
      expiresAt: null,
      withdrawn: null,
    }))
  })

  it('should remove the lnurlW from the cardVersion', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date()
    const lnurlw = createLnurlW(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlw],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    const invoiceRedis = createRedisInvoice(100)
    invoiceRedis.payment_hash = invoice.paymentHash
    invoiceRedis.payment_request = invoice.paymentRequest
    invoiceRedis.paid = Math.round(+ new Date() / 1000)
    cardRedis.invoice = invoiceRedis
    cardRedis.lnbitsWithdrawId = null

    await updateCard(cardRedis)
    expect(updateCardVesion).toHaveBeenCalledWith(expect.objectContaining({
      lnurlW: null,
    }))
  })

  it('should set the lnurlW withdrawn when the card is used', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date()
    const lnurlw = createLnurlW(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlw],
    })

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card.hash
    const invoiceRedis = createRedisInvoice(100)
    invoiceRedis.payment_hash = invoice.paymentHash
    invoiceRedis.payment_request = invoice.paymentRequest
    invoiceRedis.paid = Math.round(+ new Date() / 1000)
    cardRedis.invoice = invoiceRedis
    cardRedis.lnbitsWithdrawId = lnurlw.lnbitsId
    cardRedis.used = Math.round(+ new Date() / 1000)

    await updateCard(cardRedis)
    expect(insertOrUpdateLnurlW).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: cardRedis.lnbitsWithdrawId,
      created: expect.any(Date),
      expiresAt: null,
      withdrawn: expect.any(Date),
    }))
  })
})
