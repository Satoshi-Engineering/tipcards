import '../mocks/process.env'
import '../mocks/axios'
import { SET, SET_FUNDED } from '../mocks/redis'

import CardNotFundedError from '../../src/errors/CardNotFundedError'
import BulkWithdraw from '../../src/modules/BulkWithdraw'
import CardCollection from '../../src/modules/CardCollection'

describe('create and delete bulkwithdraw', () => {
  it('should throw an error if not initialized', async () => {
    const cards = await CardCollection.fromSetId(SET.id)
    const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
    await expect(() => bulkWithdraw.toTRpcResponse()).rejects.toThrow(Error)
  })

  it('should throw an error if not funded', async () => {
    const cards = await CardCollection.fromSetId(SET.id)
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
})
