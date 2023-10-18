import { TRPCError } from '@trpc/server'

import './initEnv'
import type { Card } from '../../../src/data/redis/Card'
import type { Set } from '../../../src/data/redis/Set'

import NotFoundError from '../../src/errors/NotFoundError'
import {
  getClient,
  createCard, deleteCard,
  createSet, deleteSet,
} from '../../src/services/database'
import { setRouter } from '../../src/trpc/router/set'

import { SET_EMPTY } from '../mocks/redis/EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP } from '../mocks/redis/FundedSetWithBulkWithdraw'

const callerLoggedOut = setRouter.createCaller({
  host: null,
  jwt: null,
  accessToken: null,
})

beforeAll(async () => {
  await Promise.all([
    initSet(SET_EMPTY),
    initCard(CARD_FUNDED_INVOICE),
    initCard(CARD_FUNDED_LNURLP),
    initSet(SET_FUNDED),
  ])
})

afterAll(async () => {
  (await getClient()).quit()
})

describe('TRpc Router Set', () => {
  it('throws 404 if set is not found', async () => {
    try {
      await callerLoggedOut.getCards('somerandomstring')
    } catch (error) {
      expect((error as TRPCError).cause instanceof NotFoundError).toBe(true)
    }
  })

  it('returns all cards for a set', async () => {
    const cards = await callerLoggedOut.getCards(SET_FUNDED.id)
    expect(cards.length).toBe(2)
    expect(cards).toEqual(expect.arrayContaining([
      expect.objectContaining({
        hash: CARD_FUNDED_INVOICE.cardHash,
      }),
      expect.objectContaining({
        hash: CARD_FUNDED_LNURLP.cardHash,
      }),
    ]))
  })

  it('returns no cards for an empty set', async () => {
    const cards = await callerLoggedOut.getCards(SET_EMPTY.id)
    expect(cards.length).toBe(0)
  })
})

const safeCall = async (callback: CallableFunction) => {
  try {
    await callback()
  } catch (error) {}
}

const initCard = async (card: Card) => {
  await safeCall(() => deleteCard(card))
  await createCard(card)
}

const initSet = async (set: Set) => {
  await safeCall(() => deleteSet(set))
  await createSet(set)
}
