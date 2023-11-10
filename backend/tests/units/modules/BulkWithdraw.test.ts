import '../mocks/process.env'
import '../mocks/axios'
import { addBulkWithdraws, addCards, addSets } from '../mocks/redis'

import CardNotFundedError from '@backend/errors/CardNotFundedError'
import WithdrawDeletedError from '@backend/errors/WithdrawDeletedError'
import BulkWithdraw from '@backend/modules/BulkWithdraw'
import CardCollection from '@backend/modules/CardCollection'

import { SET_EMPTY } from '../data/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from '../data/FundedSetWithBulkWithdraw'
import { CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from '../data/SetWithUnfundedCards'

describe('BulkWithdraw', () => {
  it('should throw an error if not initialized', async () => {
    addSets(SET_EMPTY)
    const cards = await CardCollection.fromSetId(SET_EMPTY.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(Error)
  })

  it('should throw an error if not funded', async () => {
    addCards(CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP)
    const cards = await CardCollection.fromCardHashes([CARD_UNFUNDED_INVOICE.cardHash, CARD_UNFUNDED_LNURLP.cardHash])
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.create()).rejects.toThrow(CardNotFundedError)
  })

  it('should create a new bulkWithdraw for a funded set', async () => {
    addCards(CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP)
    addSets(SET_FUNDED)
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await bulkWithdraw.create()
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    expect(typeof apiData.lnurl).toBe('string')
  })

  it('should delete a bulkwithdraw', async () => {
    addCards(CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP)
    addBulkWithdraws(BULK_WITHDRAW)
    const bulkWithdraw = await BulkWithdraw.fromId(BULK_WITHDRAW.id)
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    await bulkWithdraw.delete()
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(WithdrawDeletedError)
  })
})
