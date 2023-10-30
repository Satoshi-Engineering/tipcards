import '../mocks/process.env'
import '../mocks/axios'
import { initBulkWithdraws, initCards, initSets } from '../mocks/redis'

import CardNotFundedError from '../../src/errors/CardNotFundedError'
import WithdrawDeletedError from '../../src/errors/WithdrawDeletedError'
import BulkWithdraw from '../../src/modules/BulkWithdraw'
import CardCollection from '../../src/modules/CardCollection'

import { SET_EMPTY } from '../mocks/redis/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from '../mocks/redis/FundedSetWithBulkWithdraw'
import { CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from '../mocks/redis/SetWithUnfundedCards'

describe('BulkWithdraw', () => {
  it('should throw an error if not initialized', async () => {
    initSets({
      [SET_EMPTY.id]: SET_EMPTY,
    })
    const cards = await CardCollection.fromSetId(SET_EMPTY.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(Error)
  })

  it('should throw an error if not funded', async () => {
    initCards({
      [CARD_UNFUNDED_INVOICE.cardHash]: CARD_UNFUNDED_INVOICE,
      [CARD_UNFUNDED_LNURLP.cardHash]: CARD_UNFUNDED_LNURLP,
    })
    const cards = await CardCollection.fromCardHashes([CARD_UNFUNDED_INVOICE.cardHash, CARD_UNFUNDED_LNURLP.cardHash])
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.create()).rejects.toThrow(CardNotFundedError)
  })

  it('should create a new bulkWithdraw for a funded set', async () => {
    initCards({
      [CARD_FUNDED_INVOICE.cardHash]: CARD_FUNDED_INVOICE,
      [CARD_FUNDED_LNURLP.cardHash]: CARD_FUNDED_LNURLP,
    })
    initSets({
      [SET_FUNDED.id]: SET_FUNDED,
    })
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await bulkWithdraw.create()
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    expect(typeof apiData.lnurl).toBe('string')
  })

  it('should delete a bulkwithdraw', async () => {
    initCards({
      [CARD_FUNDED_INVOICE.cardHash]: CARD_FUNDED_INVOICE,
      [CARD_FUNDED_LNURLP.cardHash]: CARD_FUNDED_LNURLP,
    })
    initBulkWithdraws({
      [BULK_WITHDRAW.id]: BULK_WITHDRAW,
    })
    const bulkWithdraw = await BulkWithdraw.fromId(BULK_WITHDRAW.id)
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.cards.length).toBe(2)
    await bulkWithdraw.delete()
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(WithdrawDeletedError)
  })
})
