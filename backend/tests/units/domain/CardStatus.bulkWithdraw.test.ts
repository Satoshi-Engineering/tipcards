import { describe, it, expect, beforeAll } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import { isLnbitsWithdrawLinkUsed } from '../mocks/services/lnbitsHelpers.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import CardStatus from '@backend/domain/CardStatus.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
const lnurlw: LnurlW = createLnurlW(cardVersion)
lnurlw.bulkWithdrawId = 'bulkWithdrawId'

beforeAll(() => {
  addData({
    cards: [card],
    cardVersions: [cardVersion],
    invoices: [invoice],
    cardVersionInvoices: [...cardVersionsHaveInvoice],
    lnurlws: [lnurlw],
  })
})

describe('Card', () => {
  it('should handle a bulk withdraw lock', async () => {
    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.isLockedByBulkWithdraw,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should handle a pending bulk withdraw', async () => {
    isLnbitsWithdrawLinkUsed.mockImplementation(async () => true)

    const status = await CardStatus.latestFromCardHashOrDefault(card.hash)

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.bulkWithdrawPending,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })
})
