import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
  createLnurlP,
  createLnurlW,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'
import CardStatusForHistory from '@backend/domain/CardStatusForHistory.js'

describe('CardStatusForHistory', () => {
  it('should load the status of a card from cardHash', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [],
      lnurlP: null,
      lnurlW: null,
      setName: null,
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,

      landingPageViewed: null,
      bulkWithdrawCreated: null,
      setName: null,
    }))
  })

  it('should include the set name', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [],
      lnurlP: null,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.toTrpcResponse()).toEqual(expect.objectContaining({
      hash: card.hash,
      status: CardStatusEnum.enum.unfunded,
      amount: null,
      created: cardVersion.created,
      funded: null,
      withdrawn: null,

      landingPageViewed: null,
      bulkWithdrawCreated: null,
      setName: 'testSet',
    }))
  })

  it('should use the cardVersion created as updated flag', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [],
      lnurlP: null,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(cardVersion.created)
  })

  it('should use the invoice created as updated flag', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(invoice.created)
  })

  it('should use the lnurlp created as updated flag', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const lnurlP = createLnurlP(cardVersion)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)
    invoice.extra = `{ "lnurlp": "${lnurlP.lnbitsId}" }`

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(lnurlP.created)
  })

  it('should use the funding as updated timestamp', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)
    await new Promise(resolve => setTimeout(resolve, 1))
    invoice.paid = new Date()

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(invoice.paid)
    expect(status.toTrpcResponse().funded).toEqual(invoice.paid)
  })

  it('should use the landing page viewed as updated timestamp', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)
    await new Promise(resolve => setTimeout(resolve, 1))
    invoice.paid = new Date()
    await new Promise(resolve => setTimeout(resolve, 1))
    cardVersion.landingPageViewed = new Date()

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(cardVersion.landingPageViewed)
  })

  it('should use the lnurlw created as updated timestamp, if it\' a bulkwithdraw', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)
    await new Promise(resolve => setTimeout(resolve, 1))
    invoice.paid = new Date()
    await new Promise(resolve => setTimeout(resolve, 1))
    cardVersion.landingPageViewed = new Date()
    await new Promise(resolve => setTimeout(resolve, 1))
    const lnurlW = createLnurlW(cardVersion)
    lnurlW.bulkWithdrawId = 'bulkWithdrawId'

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(lnurlW.created)
  })

  it('should use the lnurlw used as updated timestamp', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    await new Promise(resolve => setTimeout(resolve, 1))
    const { invoice } = createInvoice(100, cardVersion)
    await new Promise(resolve => setTimeout(resolve, 1))
    invoice.paid = new Date()
    await new Promise(resolve => setTimeout(resolve, 1))
    cardVersion.landingPageViewed = new Date()
    await new Promise(resolve => setTimeout(resolve, 1))
    const lnurlW = createLnurlW(cardVersion)
    lnurlW.bulkWithdrawId = 'bulkWithdrawId'
    await new Promise(resolve => setTimeout(resolve, 1))
    lnurlW.withdrawn = new Date()

    const status = CardStatusForHistory.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW,
      setName: 'testSet',
    })

    expect(status.updated).toEqual(lnurlW.withdrawn)
  })
})
