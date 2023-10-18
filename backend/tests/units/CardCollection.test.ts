import '../mocks/process.env'
import '../mocks/axios'
import '../mocks/redis'

import CardNotFundedError from '../../src/errors/CardNotFundedError'
import CardCollection from '../../src/modules/CardCollection'

import { SET_EMPTY } from '../mocks/redis/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP } from '../mocks/redis/FundedSetWithBulkWithdraw'
import { SET_UNFUNDED } from '../mocks/redis/SetWithUnfundedCards'

describe('CardCollection', () => {
  it('load no cards for an empty set', async () => {
    const cards = await CardCollection.fromSetId(SET_EMPTY.id)
    expect(cards.length).toBe(0)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(0)
  })

  it('should throw error if not funded', async () => {
    const cards = await CardCollection.fromSetId(SET_UNFUNDED.id)
    expect(() => cards.getFundedAmount()).toThrow(CardNotFundedError)
  })

  it('should calculate the funded amount', async () => {
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(300)
  })

  it('should lock and release all cards', async () => {
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)

    await cards.lockByBulkWithdraw()
    let apiData = await cards.toTRpcResponse()
    expect(apiData).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: CARD_FUNDED_INVOICE.cardHash,
        isLockedByBulkWithdraw: true,
      }),
      expect.objectContaining({
        hash: CARD_FUNDED_LNURLP.cardHash,
        isLockedByBulkWithdraw: true,
      }),
    ]))

    await cards.releaseBulkWithdrawLock()
    apiData = await cards.toTRpcResponse()
    expect(apiData).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: CARD_FUNDED_INVOICE.cardHash,
        isLockedByBulkWithdraw: false,
      }),
      expect.objectContaining({
        hash: CARD_FUNDED_LNURLP.cardHash,
        isLockedByBulkWithdraw: false,
      }),
    ]))
  })
})
