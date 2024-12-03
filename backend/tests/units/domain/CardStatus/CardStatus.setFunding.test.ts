import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
} from '../../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import CardStatus from '@backend/domain/CardStatus.js'

const setCard1 = createCard()
const setCardVersion1 = createCardVersion(setCard1)
const setCard2 = createCard()
const setCardVersion2 = createCardVersion(setCard2)
const { invoice: setInvoice } = createInvoice(100, setCardVersion1, setCardVersion2)

describe('Card', () => {
  it('should load the status of a card with set funding invoice', async () => {
    const status = CardStatus.fromData({
      cardVersion: setCardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(setInvoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.setInvoiceFunding,
      amount: 50,
      created: setInvoice.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should handle an expired set funding invoice', async () => {
    setInvoice.expiresAt = new Date(0)

    const status = CardStatus.fromData({
      cardVersion: setCardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(setInvoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.setInvoiceExpired,
      amount: 50,
      created: setInvoice.created,
      funded: null,
      withdrawn: null,
    }))
  })

  it('should load the status of a card funded by set funding invoice', async () => {
    setInvoice.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)
    setInvoice.paid = new Date(1230980400000)

    const status = CardStatus.fromData({
      cardVersion: setCardVersion1,
      invoices: [new InvoiceWithSetFundingInfo(setInvoice, 2)],
      lnurlP: null,
      lnurlW: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: setCard1.hash,
      status: CardStatusEnum.enum.funded,
      amount: 50,
      created: setInvoice.created,
      funded: setInvoice.paid,
      withdrawn: null,
    }))
  })
})
