import { describe, it, expect, assert } from 'vitest'

import '../mocks/database/client.js'
import {
  addSets,
  addCards, addCardVersions,
  addInvoices, addCardVersionInvoices,
  addLnurlPs, addLnurlWs,
} from '../mocks/database/database.js'
import '../mocks/axios.js'
import '../mocks/drizzle.js'
import '../mocks/process.env.js'
import {
  createSet, createCardForSet,
  createCard, createCardVersion,
  createInvoice,
  createLnurlP, createLnurlW,
} from '../../drizzleData.js'

import CardNotFundedError from '@backend/errors/CardNotFundedError.js'
import WithdrawDeletedError from '@backend/errors/WithdrawDeletedError.js'
import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

describe('BulkWithdraw', () => {
  it('should throw an error if not created', async () => {
    const set = createSet()
    addSets(set)
    const cards = await CardCollectionDeprecated.fromSetId(set.id)
    const bulkWithdraw = BulkWithdrawDeprecated.fromCardCollection(cards)
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(Error)
  })

  it('should throw an error if not funded', async () => {
    const card1 = createCard()
    const card2 = createCard()
    addCards(card1, card2)
    addCardVersions(createCardVersion(card1), createCardVersion(card2))

    const cards = await CardCollectionDeprecated.fromCardHashes([card1.hash, card2.hash])
    const bulkWithdraw = BulkWithdrawDeprecated.fromCardCollection(cards)
    await expect(() => bulkWithdraw.create()).rejects.toThrow(CardNotFundedError)
  })

  it('should create a new bulkWithdraw for a funded set', async () => {
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
    const bulkWithdraw = BulkWithdrawDeprecated.fromCardCollection(cards)
    await bulkWithdraw.create()
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    expect(typeof apiData.lnurl).toBe('string')
  })

  it('should delete a bulkwithdraw', async () => {
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
    const lnurlw = createLnurlW(cardVersion1, cardVersion2)
    addSets(set)
    addCards(card1, card2)
    addCardVersions(cardVersion1, cardVersion2)
    addInvoices(invoice1, invoice2)
    addCardVersionInvoices(...cardVersionsHaveInvoice1, ...cardVersionsHaveInvoice2)
    addLnurlPs(lnurlp)
    addLnurlWs(lnurlw)

    assert(lnurlw.bulkWithdrawId, 'lnurlw should be a bulkWithdraw')
    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(lnurlw.bulkWithdrawId)
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    await bulkWithdraw.delete()
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(WithdrawDeletedError)
  })
})
