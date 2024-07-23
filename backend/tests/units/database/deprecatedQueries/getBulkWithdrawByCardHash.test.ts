import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createCard, createCardVersion,
  createInvoice, createLnurlW,
} from '../../../drizzleData.js'

import NotFoundError from '@backend/errors/NotFoundError.js'

import { getBulkWithdrawByCardHash } from '@backend/database/deprecated/queries.js'

describe('getBulkWithdrawById', () => {
  it('should throw an error if the bulkWithdraw doesnt exist', async () => {
    await expect(async () => await getBulkWithdrawByCardHash('some strange id')).rejects.toThrow(NotFoundError)
  })

  it('should return a bulkWithdraw', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(500, cardVersion1, cardVersion2)
    invoice.paid = new Date()
    const lnurlw = createLnurlW(cardVersion1, cardVersion2)
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlw],
    })

    const bulkWithdraw = await getBulkWithdrawByCardHash(card1.hash)
    expect(bulkWithdraw).toEqual(expect.objectContaining({
      id: lnurlw.bulkWithdrawId,
      created: expect.any(Number),
      amount: invoice.amount,
      cards: expect.arrayContaining([card1.hash, card2.hash]),
      lnbitsWithdrawId: lnurlw.lnbitsId,
      lnbitsWithdrawDeleted: null,
      withdrawn: null,
    }))
  })

  it('should return a used bulkWithdraw', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(500, cardVersion1, cardVersion2)
    invoice.paid = new Date()
    const lnurlw = createLnurlW(cardVersion1, cardVersion2)
    lnurlw.withdrawn = new Date()
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlw],
    })

    const bulkWithdraw = await getBulkWithdrawByCardHash(card1.hash)
    expect(bulkWithdraw).toEqual(expect.objectContaining({
      id: lnurlw.bulkWithdrawId,
      created: expect.any(Number),
      amount: invoice.amount,
      cards: expect.arrayContaining([card1.hash, card2.hash]),
      lnbitsWithdrawId: lnurlw.lnbitsId,
      lnbitsWithdrawDeleted: null,
      withdrawn: expect.any(Number),
    }))
  })
})
