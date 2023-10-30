import axios from 'axios'

import '../initEnv'
import { initCard, initSet, deleteBulkWithdraw as deleteBulkWithdrawRedis } from '../initRedis'

import { decodeLnurl } from '../../../../src/modules/lnurlHelpers'
import { BulkWithdraw } from '../../../src/trpc/data/BulkWithdraw'
import { bulkWithdrawRouter } from '../../../src/trpc/router/bulkWithdraw'
import { setRouter } from '../../../src/trpc/router/set'
import { TIPCARDS_API_ORIGIN } from '../../../src/constants'

import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP, BULK_WITHDRAW } from './FundedSetWithBulkWithdraw'
import { CARD_UNFUNDED_INVOICE, CARD_UNFUNDED_LNURLP } from './SetWithUnfundedCards'

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
    deleteBulkWithdrawRedis(BULK_WITHDRAW),
    initCard(CARD_FUNDED_INVOICE),
    initCard(CARD_FUNDED_LNURLP),
    initSet(SET_FUNDED),
    initCard(CARD_UNFUNDED_INVOICE),
    initCard(CARD_UNFUNDED_LNURLP),
  ])
})

describe('TRpc Router BulkWithdraw', () => {
  it('throws an error if a card doesnt exist', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, 'somerandomcardhash'])).rejects.toThrow(Error)
  })

  it('throws an error if a card is not funded', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, CARD_UNFUNDED_LNURLP.cardHash])).rejects.toThrow(Error)
  })

  it('creates and deletes a bulkWithdraw', async () => {
    const bulkWithdraw = await createBulkWithdraw()
    await checkIfLnurlwExistsInLnbits(bulkWithdraw)
    await checkIfCardsAreLocked()

    await deleteBulkWithdraw()
    await checkIfLnurlwIsRemoved(bulkWithdraw)
    await checkIfCardsAreReleased()
  })
})

const createBulkWithdraw = async () => {
  const bulkWithdraw = await callerBulkWithdraw.createForCards([CARD_FUNDED_INVOICE.cardHash, CARD_FUNDED_LNURLP.cardHash])
  expect(bulkWithdraw.amount).toBe(300)
  expect(bulkWithdraw.cards.length).toBe(2)
  return bulkWithdraw
}

const checkIfLnurlwExistsInLnbits = async (bulkWithdraw: BulkWithdraw) => {
  const { data } = await axios.get(decodeLnurl(bulkWithdraw.lnurl))
  expect(data.minWithdrawable).toBe(300 * 1000)
  expect(data.maxWithdrawable).toBe(300 * 1000)
}

const checkIfCardsAreLocked = async () => {
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
}

const deleteBulkWithdraw = async () => {
  await callerBulkWithdraw.deleteByCardHash(CARD_FUNDED_INVOICE.cardHash)
}

const checkIfLnurlwIsRemoved = async (bulkWithdraw: BulkWithdraw) => {
  await expect(() => axios.get(decodeLnurl(bulkWithdraw.lnurl))).rejects.toThrow(Error)
}

const checkIfCardsAreReleased = async () => {
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
}
