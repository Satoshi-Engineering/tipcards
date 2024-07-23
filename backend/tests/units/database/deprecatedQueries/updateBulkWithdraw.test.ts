import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createCard, createCardVersion,
  createInvoice, createLnurlW,
} from '../../../drizzleData.js'
import { createBulkWithdraw as createBulkWithdrawData } from '../../../redisData.js'

import { updateBulkWithdraw } from '@backend/database/deprecated/queries.js'

describe('updateBulkWithdraw', () => {
  it('should mark the used lnurlw as withdrawn', async () => {
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

    const bulkWithdraw = createBulkWithdrawData(invoice.amount, card1.hash, card2.hash)
    bulkWithdraw.withdrawn = Math.round(+ new Date() / 1000)
    await updateBulkWithdraw(bulkWithdraw)
    expect(queries.insertOrUpdateLnurlW).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: bulkWithdraw.lnbitsWithdrawId,
      created: expect.any(Date),
      expiresAt: null,
      withdrawn: expect.any(Date),
      bulkWithdrawId: bulkWithdraw.id,
    }))
  })

  it('should change nothing if lnbitsWithdrawDeleted is set', async () => {
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

    const bulkWithdraw = createBulkWithdrawData(invoice.amount, card1.hash, card2.hash)
    bulkWithdraw.lnbitsWithdrawDeleted = Math.round(+ new Date() / 1000)
    await updateBulkWithdraw(bulkWithdraw)
    expect(queries.updateCardVersion).not.toHaveBeenCalled()
  })
})
