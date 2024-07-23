import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createCard, createCardVersion,
  createInvoice,
} from '../../../drizzleData.js'
import { createBulkWithdraw as createBulkWithdrawData } from '../../../redisData.js'

import { createBulkWithdraw } from '@backend/database/deprecated/queries.js'

describe('createBulkWithdraw', () => {
  it('should create a bulkBithdraw', async () => {
    const card1 = createCard()
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCard()
    const cardVersion2 = createCardVersion(card2)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(500, cardVersion1, cardVersion2)
    invoice.paid = new Date()
    addData({
      cards: [card1, card2],
      cardVersions: [cardVersion1, cardVersion2],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const bulkWithdraw = createBulkWithdrawData(invoice.amount, card1.hash, card2.hash)
    await createBulkWithdraw(bulkWithdraw)
    expect(queries.updateCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion1.id,
      card: card1.hash,
      lnurlW: bulkWithdraw.lnbitsWithdrawId,
    }))
    expect(queries.updateCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion2.id,
      card: card2.hash,
      lnurlW: bulkWithdraw.lnbitsWithdrawId,
    }))
    expect(queries.insertOrUpdateLnurlW).toHaveBeenCalledWith(expect.objectContaining({
      lnbitsId: bulkWithdraw.lnbitsWithdrawId,
      created: expect.any(Date),
      expiresAt: null,
      withdrawn: null,
      bulkWithdrawId: bulkWithdraw.id,
    }))
  })
})
