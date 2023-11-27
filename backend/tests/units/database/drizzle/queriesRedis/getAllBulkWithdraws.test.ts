import '../../../mocks/process.env'
import { addData } from '../mocks/queries'

import { 
  createCard, createCardVersion,
  createInvoice, createLnurlW,
} from '../../../../drizzleData'

import { getAllBulkWithdraws } from '@backend/database/drizzle/queriesRedis'

describe('getAllBulkWithdraws', () => {
  it('should return all bulkWithdraws', async () => {
    const card11 = createCard()
    const cardVersion11 = createCardVersion(card11)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionsHaveInvoice1 } = createInvoice(500, cardVersion11)
    invoice1.paid = new Date()
    const lnurlw1 = createLnurlW(cardVersion11)

    const card21 = createCard()
    const cardVersion21 = createCardVersion(card21)
    const card22 = createCard()
    const cardVersion22 = createCardVersion(card22)
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionsHaveInvoice2 } = createInvoice(500, cardVersion21, cardVersion22)
    invoice2.paid = new Date()
    const lnurlw2 = createLnurlW(cardVersion21, cardVersion22)

    const card31 = createCard()
    const cardVersion31 = createCardVersion(card31)
    const card32 = createCard()
    const { invoice: invoice31, cardVersionsHaveInvoice: cardVersionsHaveInvoice31 } = createInvoice(300, cardVersion31)
    invoice31.paid = new Date()
    const cardVersion32 = createCardVersion(card32)
    const { invoice: invoice32, cardVersionsHaveInvoice: cardVersionsHaveInvoice32 } = createInvoice(800, cardVersion32)
    invoice32.paid = new Date()
    const lnurlw3 = createLnurlW(cardVersion31, cardVersion32)
    addData({
      cards: [card11, card21, card22, card31, card32],
      cardVersions: [cardVersion11, cardVersion21, cardVersion22, cardVersion31, cardVersion32],
      invoices: [invoice1, invoice2, invoice31, invoice32],
      cardVersionInvoices: [
        ...cardVersionsHaveInvoice1,
        ...cardVersionsHaveInvoice2,
        ...cardVersionsHaveInvoice31,
        ...cardVersionsHaveInvoice32,
      ],
      lnurlws: [lnurlw1, lnurlw2, lnurlw3],
    })

    const bulkWithdraws = await getAllBulkWithdraws()
    expect(bulkWithdraws.length).toBe(2)
    expect(bulkWithdraws).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: lnurlw2.lnbitsId,
        created: expect.any(Number),
        amount: invoice2.amount,
        cards: expect.arrayContaining([card21.hash, card22.hash]),
        lnbitsWithdrawId: lnurlw2.lnbitsId,
        lnbitsWithdrawDeleted: null,
        withdrawn: null,
      }),
      expect.objectContaining({
        id: lnurlw3.lnbitsId,
        created: expect.any(Number),
        amount: invoice31.amount + invoice32.amount,
        cards: expect.arrayContaining([card31.hash, card32.hash]),
        lnbitsWithdrawId: lnurlw3.lnbitsId,
        lnbitsWithdrawDeleted: null,
        withdrawn: null,
      }),
    ]))
  })
})
