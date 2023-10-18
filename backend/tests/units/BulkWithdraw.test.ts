import '../mocks/process.env'
import '../mocks/axios'
import '../mocks/redis'

import CardNotFundedError from '../../src/errors/CardNotFundedError'
import WithdrawDeletedError from '../../src/errors/WithdrawDeletedError'
import BulkWithdraw from '../../src/modules/BulkWithdraw'
import CardCollection from '../../src/modules/CardCollection'

import { SET_EMPTY } from '../mocks/redis/EmptySet'
import { SET_FUNDED, BULK_WITHDRAW } from '../mocks/redis/FundedSetWithBulkWithdraw'
import { SET_UNFUNDED } from '../mocks/redis/SetWithUnfundedCards'

describe('BulkWithdraw', () => {
  it('should throw an error if not initialized', async () => {
    const cards = await CardCollection.fromSetId(SET_EMPTY.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(Error)
  })

  it('should throw an error if not funded', async () => {
    const cards = await CardCollection.fromSetId(SET_UNFUNDED.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.create()).rejects.toThrow(CardNotFundedError)
  })

  it('should create a new bulkWithdraw for a funded set', async () => {
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await bulkWithdraw.create()
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.numberOfCards).toBe(2)
    expect(typeof apiData.lnurl).toBe('string')
  })

  it('should delete a bulkwithdraw', async () => {
    const bulkWithdraw = await BulkWithdraw.fromId(BULK_WITHDRAW.id)
    const apiData = await bulkWithdraw.toTRpcResponse()
    expect(apiData.amount).toBe(300)
    expect(apiData.numberOfCards).toBe(2)
    await bulkWithdraw.delete()
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(WithdrawDeletedError)
  })
})
