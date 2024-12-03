import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import { LnurlW } from '@backend/database/schema/LnurlW.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import CardStatus from '@backend/domain/CardStatus.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice } = createInvoice(100, cardVersion)
const lnurlW: LnurlW = createLnurlW(cardVersion)
lnurlW.bulkWithdrawId = 'bulkWithdrawId'

describe('CardStatus', () => {
  it('should handle a bulk withdraw lock', async () => {
    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.isLockedByBulkWithdraw,
      amount: 100,
      created: invoice.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a card that has been withdrawn by bulkWithdraw', async () => {
    lnurlW.withdrawn = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawnByBulkWithdraw,
      amount: 100,
      created: invoice.created,
      funded: invoice.paid,
      withdrawn: lnurlW.withdrawn,
    }))
  })
})
