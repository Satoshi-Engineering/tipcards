import { describe, it, expect } from 'vitest'

import '../mocks/database/client.js'
import {
  addSets,
  addCards, addCardVersions,
  addInvoices, addCardVersionInvoices,
  addLnurlPs,
} from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createSet, createCardForSet,
  createCardVersion,
  createInvoice,
  createLnurlP,
} from '../../drizzleData.js'

import CardNotFundedError from '@backend/errors/CardNotFundedError.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'
describe('CardCollection', () => {
  it('should load no cards when loading an empty set', async () => {
    const set = createSet()
    addSets(set)

    const cards = await CardCollectionDeprecated.fromSetId(set.id)
    expect(cards.length).toBe(0)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(0)
  })

  it('should throw an error, if the amount is caluclated for a not funded set', async () => {
    const set = createSet()
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    addSets(set)
    addCards(card1, card2)
    addCardVersions(cardVersion1, cardVersion2)
    const cards = await CardCollectionDeprecated.fromSetId(set.id)
    expect(() => cards.getFundedAmount()).toThrow(CardNotFundedError)
  })

  it('should calculate the funded amount for a set', async () => {
    const set = createSet()
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionsHaveInvoice1 } = createInvoice(100, cardVersion1)
    invoice1.paid = new Date()
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const lnurlp = createLnurlP(cardVersion2)
    lnurlp.finished = new Date()
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionsHaveInvoice2 } = createInvoice(200, cardVersion2)
    invoice2.paid = new Date()
    addSets(set)
    addCards(card1, card2)
    addCardVersions(cardVersion1, cardVersion2)
    addInvoices(invoice1, invoice2)
    addCardVersionInvoices(...cardVersionsHaveInvoice1, ...cardVersionsHaveInvoice2)
    addLnurlPs(lnurlp)

    const cards = await CardCollectionDeprecated.fromSetId(set.id)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(300)
  })

  it('should lock and release all cards for a set', async () => {
    const set = createSet()
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const { invoice: invoice1, cardVersionsHaveInvoice: cardVersionsHaveInvoice1 } = createInvoice(100, cardVersion1)
    invoice1.paid = new Date()
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const lnurlp = createLnurlP(cardVersion2)
    lnurlp.finished = new Date()
    const { invoice: invoice2, cardVersionsHaveInvoice: cardVersionsHaveInvoice2 } = createInvoice(200, cardVersion2)
    invoice2.paid = new Date()
    addSets(set)
    addCards(card1, card2)
    addCardVersions(cardVersion1, cardVersion2)
    addInvoices(invoice1, invoice2)
    addCardVersionInvoices(...cardVersionsHaveInvoice1, ...cardVersionsHaveInvoice2)
    addLnurlPs(lnurlp)

    const cards = await CardCollectionDeprecated.fromSetId(set.id)
    await cards.lockByBulkWithdraw()
    let apiData = await cards.toTRpcResponse()
    expect(apiData).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: card1.hash,
        isLockedByBulkWithdraw: true,
      }),
      expect.objectContaining({
        hash: card2.hash,
        isLockedByBulkWithdraw: true,
      }),
    ]))

    await cards.releaseBulkWithdrawLock()
    apiData = await cards.toTRpcResponse()
    expect(apiData).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: card1.hash,
        isLockedByBulkWithdraw: false,
      }),
      expect.objectContaining({
        hash: card2.hash,
        isLockedByBulkWithdraw: false,
      }),
    ]))
  })
})
