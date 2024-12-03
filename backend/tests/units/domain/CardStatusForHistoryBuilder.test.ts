import { describe, it, expect } from 'vitest'

import '../mocks/database/client.js'
import { addData } from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createSet, createSetSettings, createCardForSet,
  createCard, createCardVersion,
  createInvoice,
  createLnurlW,
} from '../../drizzleData.js'

import CardStatusForHistoryBuilder from '@backend/domain/CardStatusForHistoryBuilder.js'

describe('CardStatusForHistoryBuilder', () => {
  it('should resolve a card status just as a normal CardStatus', async () => {
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

    const builder = new CardStatusForHistoryBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toEqual(lnurlW)
    expect(status.setName).toBe(null)
  })

  it('should resolve the set name', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    const card = createCardForSet(set, 0)
    const cardVersion = createCardVersion(card)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(100, cardVersion)
    const lnurlW = createLnurlW(cardVersion)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card],
      cardVersions: [cardVersion],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
      lnurlws: [lnurlW],
    })

    const builder = new CardStatusForHistoryBuilder(card.hash)
    await builder.build()
    const status = builder.getCardStatus()

    expect(status.cardVersion).toEqual(cardVersion)
    expect(status.invoices).toEqual([expect.objectContaining({ invoice, cardsFundedWithThisInvoice: 1 })])
    expect(status.lnurlP).toBeNull()
    expect(status.lnurlW).toEqual(lnurlW)
    expect(status.setName).toBe(setSettings.name)
  })

  it('should resolve the set name for multiple cards', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const card3 = createCardForSet(set, 2)
    const cardVersion3 = createCardVersion(card3)
    const { invoice, cardVersionsHaveInvoice } = createInvoice(333, cardVersion1, cardVersion2, cardVersion3)
    addData({
      sets: [set],
      setSettings: [setSettings],
      cards: [card1, card2, card3],
      cardVersions: [cardVersion1, cardVersion2, cardVersion3],
      invoices: [invoice],
      cardVersionInvoices: [...cardVersionsHaveInvoice],
    })

    const builder = new CardStatusForHistoryBuilder([card1.hash, card2.hash, card3.hash])
    await builder.build()
    const collection = builder.getCardStatusCollection()

    expect(collection.cardStatuses).toEqual(expect.arrayContaining([
      expect.objectContaining({ cardVersion: cardVersion1, setName: setSettings.name }),
      expect.objectContaining({ cardVersion: cardVersion2, setName: setSettings.name }),
      expect.objectContaining({ cardVersion: cardVersion3, setName: setSettings.name }),
    ]))
  })
})
