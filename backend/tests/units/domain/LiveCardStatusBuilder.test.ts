import { describe, it, expect } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import { isLnbitsWithdrawLinkUsed } from '../mocks/services/lnbitsHelpers.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import LiveCardStatusBuilder from '@backend/domain/LiveCardStatusBuilder.js'

describe('CardStatusBuilder', () => {
  it('should resolve a lnurlW just as a normal CardStatus', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlW],
    })

    const builder = new LiveCardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toEqual(lnurlW)
    expect(status.withdrawPending).toBe(false)
  })

  it('should resolve a pending withdraw', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)
    addData({
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlW],
    })
    isLnbitsWithdrawLinkUsed.mockImplementation(async () => true)

    const builder = new LiveCardStatusBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toEqual(lnurlW)
    expect(status.withdrawPending).toBe(true)
  })
})
