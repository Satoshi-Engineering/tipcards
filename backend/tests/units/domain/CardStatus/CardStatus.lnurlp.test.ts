import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createLnurlP,
  createInvoice,
} from '../../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import CardStatus from '@backend/domain/CardStatus.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const lnurlP = createLnurlP(cardVersion)

describe('Card', async () => {
  it('should load the status of a card from cardHash', async () => {
    const status = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpFunding,
      amount: 0,
      feeAmount: 0,
    }))
  })

  it('should handle expired lnurlp', async () => {
    lnurlP.expiresAt = new Date(0)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpExpired,
      amount: 0,
      feeAmount: 0,
    }))
  })

  it('should load status of a card funded by lnurlp', async () => {
    const { invoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date(1230980400000)
    lnurlP.expiresAt = null
    lnurlP.finished = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      feeAmount: 1,
    }))
  })

  it('should load the status of a card funded by shared funding', async () => {
    cardVersion.sharedFunding = true
    lnurlP.expiresAt = null
    lnurlP.finished = null

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedFunding,
      amount: 0,
      feeAmount: 0,
    }))
  })

  it('should handle expired lnurlp shared funding', async () => {
    lnurlP.expiresAt = new Date(0)
    const { invoice } = createInvoice(100, cardVersion)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
      amount: 0,
      feeAmount: 0,
    }))
  })

  it('should handle expired lnurlp shared funding with funds on it', async () => {
    const { invoice } = createInvoice(100, cardVersion)
    invoice.paid = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.lnurlpSharedExpiredFunded,
      amount: 100,
      feeAmount: 1,
    }))
  })

  it('should load status of a finished lnurlp funding', async () => {
    const { invoice: invoice1 } = createInvoice(100, cardVersion)
    invoice1.paid = new Date(1230980400000)
    const { invoice: invoice2 } = createInvoice(100, cardVersion)
    invoice2.paid = new Date(1230980400000)
    lnurlP.finished = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [
        new InvoiceWithSetFundingInfo(invoice1, 1),
        new InvoiceWithSetFundingInfo(invoice2, 1),
      ],
      lnurlP,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 200,
      feeAmount: 2,
    }))
  })
})
