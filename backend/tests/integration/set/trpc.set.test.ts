import { TRPCError } from '@trpc/server'

import '../initEnv'
import { initCard, initSet } from '../initRedis'

import NotFoundError from '../../../src/errors/NotFoundError'
import { createAccessToken } from '../../../src/services/jwt'
import { setRouter } from '../../../src/trpc/router/set'
import { TIPCARDS_API_ORIGIN } from '../../../src/constants'

import { SET_EMPTY } from './EmptySet'
import { SET_FUNDED, CARD_FUNDED_INVOICE, CARD_FUNDED_LNURLP } from './FundedSetWithBulkWithdraw'
import { USER, USER_SET_FUNDED, USER_CARD_FUNDED_INVOICE, USER_CARD_FUNDED_LNURLP } from './UserWithSet'

const callerLoggedOut = setRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
})

let callerLoggedIn = callerLoggedOut

beforeAll(async () => {
  await Promise.all([
    initSet(SET_EMPTY),
    initCard(CARD_FUNDED_INVOICE),
    initCard(CARD_FUNDED_LNURLP),
    initSet(SET_FUNDED),
    initCard(USER_CARD_FUNDED_INVOICE),
    initCard(USER_CARD_FUNDED_LNURLP),
    initSet(USER_SET_FUNDED),
  ])
  const jwt = await createAccessToken(USER)
  callerLoggedIn = setRouter.createCaller({
    host: new URL(TIPCARDS_API_ORIGIN).host,
    jwt,
    accessToken: null,
  })
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

  it('returns all sets and cards for a logged in user', async () => {
    const sets = await callerLoggedIn.getAll()
    expect(sets.length).toBe(1)
    const cards = await callerLoggedIn.getCards(sets[0].id)
    expect(cards.length).toBe(2)
  })
})
