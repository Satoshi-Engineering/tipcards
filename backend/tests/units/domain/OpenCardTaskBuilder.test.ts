import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createCard, createCardVersion,
  createInvoice,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'

import OpenCardTaskBuilder from '@backend/domain/OpenCardTaskBuilder.js'
import CardStatusCollection from '@backend/domain/CardStatusCollection.js'
import CardStatus from '@backend/domain/CardStatus.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenCardTaskBuilder', () => {
  it('should build a card task for an unpaid invoice', async () => {
    const card = createCard()
    const cardVersion = createCardVersion(card)
    const { invoice } = createInvoice(210, cardVersion)
    const cardStatus = CardStatus.fromData({
      cardVersion,
      invoices: [new InvoiceWithSetFundingInfo(invoice, 1)],
      lnurlP: null,
      lnurlW: null,
    })
    const cardStatusCollection = new CardStatusCollection([cardStatus])

    const builder = new OpenCardTaskBuilder(cardStatusCollection)
    await builder.build()
    const openTask = builder.openTasks[0]

    expect(openTask.cardVersion).toEqual(cardVersion)
    expect(openTask.invoices).toEqual(expect.arrayContaining([invoice]))
    expect(openTask.lnurlP).toEqual(null)
    expect(openTask.created).toEqual(invoice.created)
    expect(openTask.sats).toEqual(invoice.amount)
    expect(openTask.cardStatus).toEqual(CardStatusEnum.enum.invoiceFunding)
  })
})
