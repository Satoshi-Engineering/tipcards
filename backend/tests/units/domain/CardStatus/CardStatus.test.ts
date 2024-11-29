import { AssertionError } from 'node:assert'
import { describe, it, expect } from 'vitest'

import '../../mocks/database/client.js'
import { isLnbitsWithdrawLinkUsed } from '../../mocks/services/lnbitsHelpers.js'
import '../../mocks/axios.js'
import '../../mocks/drizzle.js'
import '../../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import { LnurlW } from '@backend/database/schema/LnurlW.js'
import CardStatus from '@backend/domain/CardStatus.js'

const card = createCard()
const cardVersion = createCardVersion(card)
const { invoice } = createInvoice(100, cardVersion)
let lnurlW: LnurlW

describe('CardStatus', () => {
  it('should get the default status of a card that does not exist', async () => {
    const status = CardStatus.fromData({
      cardVersion: {
        id: '00000000-0000-0000-0000-000000000000',
        card: 'nonexistent',
        created: new Date(),
        lnurlP: null,
        lnurlW: null,
        textForWithdraw: '',
        noteForStatusPage: '',
        sharedFunding: false,
        landingPageViewed: null,
      },
      invoices: [],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: 'nonexistent',
      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: expect.any(Date),
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a card from cardHash', async () => {
    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.invoiceFunding,
      amount: 100,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle an expired invoice', async () => {
    invoice.expiresAt = new Date(0)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.invoiceExpired,
      amount: 100,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a funded card', async () => {
    invoice.paid = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a funded card with existing lnurlW', async () => {
    lnurlW = createLnurlW(cardVersion)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.funded,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should handle a pending withdraw', async () => {
    isLnbitsWithdrawLinkUsed.mockImplementation(async () => true)
    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    await status.resolveWithdrawPending()

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawPending,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: null,
    }))
  })

  it('should load the status of a recently withdrawn card', async () => {
    lnurlW.withdrawn = new Date(Date.now() - 1000 * 60 * 4)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.recentlyWithdrawn,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: lnurlW.withdrawn,
    }))
  })

  it('should load the status of a withdrawn card', async () => {
    lnurlW.withdrawn = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.withdrawn,
      amount: 100,
      created: cardVersion.created,
      funded: invoice.paid,
      withdrawn: lnurlW.withdrawn,
    }))
  })

  it('should throw an error if a card has multiple invoices without shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice: invoice1 } = createInvoice(100, cardVersion)
    const { invoice: invoice2 } = createInvoice(100, cardVersion)

    const status = CardStatus.fromData({
      cardVersion,
      invoices: [
        new InvoiceWithSetFundingInfo(invoice1, 1),
        new InvoiceWithSetFundingInfo(invoice2, 1),
      ],
      lnurlP: null,
      lnurlW: null,
    })

    expect(() => status.toTrpcResponse()).toThrowError(AssertionError)
  })
})
