import '../../../mocks/process.env'
import { queries } from '../mocks/client'
import { addData } from '../mocks/database'

import { 
  createCard, createCardVersion,
  createInvoice, createLnurlW,
} from '../../../../drizzleData'
import { createBulkWithdraw as createBulkWithdrawData } from '../../../../redisData'

import { updateBulkWithdraw } from '@backend/database/drizzle/queriesRedis'

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
