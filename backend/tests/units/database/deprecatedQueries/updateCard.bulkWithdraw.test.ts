import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import { queries } from '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { updateCard } from '@backend/database/deprecated/queries.js'
import { dateToUnixTimestamp, dateOrNullToUnixTimestamp } from '@backend/database/deprecated/transforms/dateHelpers.js'

import { createCard, createCardVersion, createInvoice, createLnurlW } from '../../../drizzleData.js'
import { createCard as createRedisCard } from '../../../redisData.js'


describe('updateCard.bulkWithdraw', () => {
  it('should set the cardVersion withdrawn without removing the lnurlW link', async () => {
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

    const cardRedis = createRedisCard()
    cardRedis.cardHash = card1.hash
    cardRedis.setFunding = {
      created: dateToUnixTimestamp(invoice.created),
      amount: 250,
      paid: dateOrNullToUnixTimestamp(invoice.paid),
    }
    cardRedis.isLockedByBulkWithdraw = true
    cardRedis.used = Math.round(+ new Date() / 1000)

    await updateCard(cardRedis)
    expect(queries.insertOrUpdateLatestCardVersion).toHaveBeenCalledWith(expect.objectContaining({
      id: cardVersion1.id,
      card: card1.hash,
      lnurlW: cardVersion1.lnurlW,
    }))
  })
})
