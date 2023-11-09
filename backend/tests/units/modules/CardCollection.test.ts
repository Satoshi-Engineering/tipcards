import '../mocks/process.env'
import '../mocks/axios'
import { initBulkWithdraws, initCards, initSets } from '../mocks/redis'

import CardNotFundedError from '@backend/errors/CardNotFundedError'
import CardCollection from '@backend/modules/CardCollection'

import { SET_EMPTY } from '../data/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from '../data/FundedSetWithBulkWithdraw'
import { SET_UNFUNDED, CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from '../data/SetWithUnfundedCards'

describe('CardCollection', () => {
  it('should load no cards when loading an empty set', async () => {
    initSets({
      [SET_EMPTY.id]: SET_EMPTY,
    })
    const cards = await CardCollection.fromSetId(SET_EMPTY.id)
    expect(cards.length).toBe(0)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(0)
  })

  it('should throw an error, if the amount is caluclated for a not funded set', async () => {
    initCards({
      [CARD_UNFUNDED_INVOICE.cardHash]: CARD_UNFUNDED_INVOICE,
      [CARD_UNFUNDED_LNURLP.cardHash]: CARD_UNFUNDED_LNURLP,
    })
    initSets({
      [SET_UNFUNDED.id]: SET_UNFUNDED,
    })
    const cards = await CardCollection.fromSetId(SET_UNFUNDED.id)
    expect(() => cards.getFundedAmount()).toThrow(CardNotFundedError)
  })

  it('should calculate the funded amount for a set', async () => {
    initCards({
      [CARD_FUNDED_INVOICE.cardHash]: CARD_FUNDED_INVOICE,
      [CARD_FUNDED_LNURLP.cardHash]: CARD_FUNDED_LNURLP,
    })
    initSets({
      [SET_FUNDED.id]: SET_FUNDED,
    })
    const cards = await CardCollection.fromSetId(SET_FUNDED.id)
    const amount = cards.getFundedAmount()
    expect(amount).toBe(300)
  })

  it('should lock and release all cards for a set', async () => {
    initCards({
      [CARD_FUNDED_INVOICE.cardHash]: CARD_FUNDED_INVOICE,
      [CARD_FUNDED_LNURLP.cardHash]: CARD_FUNDED_LNURLP,
    })
    initSets({
      [SET_FUNDED.id]: SET_FUNDED,
    })
    initBulkWithdraws({
      [BULK_WITHDRAW.id]: BULK_WITHDRAW,
    })
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
