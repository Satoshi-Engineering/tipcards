import axios from 'axios'
import './initEnv'
import type { Card } from '../../../src/data/redis/Card'
import type { Set } from '../../../src/data/redis/Set'

import {
  createCard, deleteCard,
  createSet, deleteSet,
  deleteBulkWithdraw,
} from '../../src/services/database'
import { decodeLnurl } from '../../../src/modules/lnurlHelpers'
import { bulkWithdrawRouter } from '../../src/trpc/router/bulkWithdraw'
import { setRouter } from '../../src/trpc/router/set'
import { TIPCARDS_API_ORIGIN } from '../../src/constants'

import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from '../mocks/redis/FundedSetWithBulkWithdraw'
import { CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from '../mocks/redis/SetWithUnfundedCards'

const callerBulkWithdraw = bulkWithdrawRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

const callerSet = setRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

beforeAll(async () => {
  await Promise.all([
    safeCall(() => deleteBulkWithdraw(BULK_WITHDRAW)),
    initCard(CARD_FUNDED_INVOICE),
    initCard(CARD_FUNDED_LNURLP),
    initSet(SET_FUNDED),
    initCard(CARD_UNFUNDED_INVOICE),
    initCard(CARD_UNFUNDED_LNURLP),
  ])
})

describe('TRpc Router BulkWithdraw', () => {
  it('throws error unknown cards', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, 'somerandomcardhash'])).rejects.toThrow(Error)
  })

  it('throws error for unfunded cards', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, CARD_UNFUNDED_LNURLP.cardHash])).rejects.toThrow(Error)
  })

  it('should create and delete bulkWithdraw', async () => {
    // create bulkWithdraw
    const bulkWithdraw = await callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash])
    expect(bulkWithdraw.amount).toBe(300)
    expect(bulkWithdraw.numberOfCards).toBe(2)

    // check if lnurlw exists in lnbits
    const { data } = await axios.get(decodeLnurl(bulkWithdraw.lnurl))
    expect(data.minWithdrawable).toBe(300 * 1000)
    expect(data.maxWithdrawable).toBe(300 * 1000)
    
    // check if cards are locked
    const cardsLocked = await callerSet.getCards(SET_FUNDED.id)
    expect(cardsLocked).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: CARD_FUNDED_INVOICE.cardHash,
        isLockedByBulkWithdraw: true,
      }),
      expect.objectContaining({
        hash: CARD_FUNDED_LNURLP.cardHash,
        isLockedByBulkWithdraw: true,
      }),
    ]))

    // delete bulkwithdraw
    await callerBulkWithdraw.deleteByCardHash(CARD_FUNDED_INVOICE.cardHash)

    // check if lnurlw is removed
    await expect(() => axios.get(decodeLnurl(bulkWithdraw.lnurl))).rejects.toThrow(Error)

    // check if cards are released
    const cardsReleased = await callerSet.getCards(SET_FUNDED.id)
    expect(cardsReleased).toEqual(expect.arrayContaining([
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

const safeCall = async (callback: CallableFunction) => {
  try {
    await callback()
  } catch (error) {
    // linter complains about empty block
  }
}

const initCard = async (card: Card) => {
  await safeCall(() => deleteCard(card))
  await createCard(card)
}

const initSet = async (set: Set) => {
  await safeCall(() => deleteSet(set))
  await createSet(set)
}
