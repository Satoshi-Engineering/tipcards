import '../mocks/process.env'
import {
  SET, SET_FUNDED,
  CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP,
} from '../mocks/redis'

import CardNotFundedError from '../../src/errors/CardNotFundedError'
import CardCollection from '../../src/modules/CardCollection'

describe('Load cards from database and manipulate them', () => {
  it('loads cards for a set', async () => {
    const cards = await CardCollection.fromSetId(SET.id)
    expect(cards.length).toBe(8)
  })

  it('should throw not funded error', async () => {
    const cards = await CardCollection.fromSetId(SET.id)
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
