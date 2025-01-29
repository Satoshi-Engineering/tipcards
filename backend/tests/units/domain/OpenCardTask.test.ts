import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createCardVersion,
  createInvoice,
  createCard,
  createLnurlP,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'

import { OpenCardTask } from '@backend/domain/OpenCardTask.js'

describe('OpenCardTask', () => {
  it('should build the correct OpenCardTaskDto for invoice funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(210, cardVersion)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [invoice],
      lnurlP: null,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: invoice.created,
      amount: 210,
      feeAmount: 3,
      cardStatus: CardStatusEnum.enum.invoiceFunding,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for an expired invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.created = new Date(0)
    invoice.expiresAt = new Date(5 * 60 * 1000)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [invoice],
      lnurlP: null,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: invoice.created,
      amount: 210,
      feeAmount: 3,
      cardStatus: CardStatusEnum.enum.invoiceExpired,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for lnurlp funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlP = createLnurlP(cardVersion)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 0,
      feeAmount: 0,
      cardStatus: CardStatusEnum.enum.lnurlpFunding,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for expired lnurlp', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 0,
      feeAmount: 0,
      cardStatus: CardStatusEnum.enum.lnurlpExpired,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    const { invoice } = createInvoice(210, cardVersion)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [invoice],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 0,
      feeAmount: 0,
      cardStatus: CardStatusEnum.enum.lnurlpSharedFunding,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for expired shared funding', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 0,
      feeAmount: 0,
      cardStatus: CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for shared funding with an already paid invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.paid = new Date()

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [invoice],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 210,
      feeAmount: 3,
      cardStatus: CardStatusEnum.enum.lnurlpSharedFunding,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })

  it('should build the correct OpenCardTaskDto for expired shared funding with an already paid invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    cardVersion.sharedFunding = true
    const lnurlP = createLnurlP(cardVersion)
    lnurlP.created = new Date(0)
    lnurlP.expiresAt = new Date(5 * 60 * 1000)
    const { invoice } = createInvoice(210, cardVersion)
    invoice.paid = new Date()

    const openTask = OpenCardTask.fromData({
      cardVersion,
      invoices: [invoice],
      lnurlP,
    })

    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.cardAction,
      created: lnurlP.created,
      amount: 210,
      feeAmount: 3,
      cardStatus: CardStatusEnum.enum.lnurlpSharedExpiredFunded,
      cardHash: card.hash,
      noteForStatusPage: cardVersion.noteForStatusPage,
      textForWithdraw: cardVersion.textForWithdraw,
    })
  })
})
