import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import LiveCardStatus from '@backend/domain/LiveCardStatus.js'

describe('LiveCardStatus', () => {
  it('should load the status of a card from cardHash', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(100, cardVersion)

    const status = LiveCardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
      withdrawPending: true,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.invoiceFunding,
      amount: 100,
    }))
  })

  it('should handle a pending withdraw', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)

    const status = LiveCardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
      withdrawPending: true,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawPending,
      amount: 100,
    }))
  })

  it('should handle a pending bulk withdraw', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)
    lnurlW.bulkWithdrawId = 'bulkWithdrawId'

    const status = LiveCardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
      withdrawPending: true,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.bulkWithdrawPending,
      amount: 100,
    }))
  })

  it('should load the status of a withdrawn card', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)
    lnurlW.withdrawn = new Date(1230980400000)

    const status = LiveCardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
      withdrawPending: false,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawn,
      amount: 100,
    }))
  })
})
