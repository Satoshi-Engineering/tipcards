import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import axios, { AxiosError } from 'axios'
import { randomUUID } from 'crypto'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { BulkWithdraw } from '@shared/data/trpc/BulkWithdraw.js'
import { ErrorCode, type ErrorResponse } from '@shared/data/Errors.js'
import LNURL from '@shared/modules/LNURL/LNURL.js'

import Database from '@backend/database/Database.js'
import { bulkWithdrawRouter } from '@backend/trpc/router/tipcards/bulkWithdraw.js'
import { setRouter } from '@backend/trpc/router/tipcards/set.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import Frontend from '../lib/frontend/Frontend.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { API_ORIGIN, WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'

ApplicationEventEmitter.init()
CardLockManager.init({ aquireTimeout: 1000 })

const callerBulkWithdraw = bulkWithdrawRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
  applicationEventEmitter: ApplicationEventEmitter.instance,
  cardLockManager: CardLockManager.instance,
})

const callerSet = setRouter.createCaller({
  host: new URL(TIPCARDS_API_ORIGIN).host,
  jwt: null,
  accessToken: null,
  applicationEventEmitter: ApplicationEventEmitter.instance,
  cardLockManager: CardLockManager.instance,
})

const FE = new Frontend()

const AMOUNT_PER_CARD = 200

const CARD_HASH_NOT_EXISTING = FE.getCardHashBySetIdAndCardIndex(randomUUID(), 0)
const CARD_HASH_UNFUNDED = FE.getCardHashBySetIdAndCardIndex(randomUUID(), 0)
const SET_ID = randomUUID()
const CARD_HASH_FUNDED_0 = FE.getCardHashBySetIdAndCardIndex(SET_ID, 0)
const CARD_HASH_FUNDED_1 = FE.getCardHashBySetIdAndCardIndex(SET_ID, 1)

const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)

beforeAll(async () => {
  await Database.init()

  const data = await wallet.getWalletDetails()
  if (data == null || data.balance <= AMOUNT_PER_CARD * 2 * 1000) {
    throw new Error('Not enough balance in lnbits wallet that is configured for integration tests.')
  }

  await Promise.all([
    initCard(CARD_HASH_UNFUNDED),
    initFundedSet(SET_ID),
  ])
})

afterAll(async () => {
  await Database.closeConnectionIfExists()
})

describe('TRpc Router BulkWithdraw', () => {
  it('throws an error if a card doesnt exist', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_HASH_NOT_EXISTING, CARD_HASH_UNFUNDED])).rejects.toThrow(Error)
  })

  it('throws an error if a card is not funded', async () => {
    await expect(() => callerBulkWithdraw.createForCards([CARD_HASH_FUNDED_0, CARD_HASH_UNFUNDED])).rejects.toThrow(Error)
  })

  it('creates and deletes a bulkWithdraw', async () => {
    const bulkWithdraw = await createBulkWithdraw()

    await checkIfLnurlwExistsInLnbits(bulkWithdraw)
    await checkIfCardsAreLocked()
    await checkIfLnurlRouteHandlesBulkWithdrawLock()

    await deleteBulkWithdraw()
    await checkIfLnurlwIsRemoved(bulkWithdraw)
    await checkIfCardsAreReleased()
  })

  it('creates and withdraws a bulkWithdraw', async () => {
    const bulkWithdraw = await createBulkWithdraw()

    await checkIfLnurlwExistsInLnbits(bulkWithdraw)
    await checkIfCardsAreLocked()

    await withdrawBulkWithdraw(bulkWithdraw)
    await checkIfBulkWithdrawIsPending(bulkWithdraw)
    await sendWebhook(bulkWithdraw)
    await checkIfLnurlwIsWithdrawn(bulkWithdraw)
    await checkIfCardsAreWithdrawn()
  })
})

async function initCard(cardHash: string) {
  const fundedCardResponse = await FE.createCardViaAPI(cardHash, AMOUNT_PER_CARD)
  if (fundedCardResponse.data.status !== 'success') {
    throw new Error(`Creating card ${cardHash} was not successful.`)
  }
  return fundedCardResponse.data.data
}

async function initFundedSet(setId: string) {
  const setInvoiceResponse = await FE.createSetFundingInvoice(setId, AMOUNT_PER_CARD, [0, 1])
  await wallet.payInvoice(setInvoiceResponse.data.data.invoice.payment_request)
  const setResponse = await FE.loadSet(SET_ID)
  if (!setResponse.data.data.invoice.paid) {
    throw new Error(`Funding set ${setId} was not successful.`)
  }
}

const createBulkWithdraw = async () => {
  const bulkWithdraw = await callerBulkWithdraw.createForCards([CARD_HASH_FUNDED_0, CARD_HASH_FUNDED_1])
  expect(bulkWithdraw.amount).toBe(AMOUNT_PER_CARD * 2)
  expect(bulkWithdraw.cards.length).toBe(2)
  return bulkWithdraw
}

const checkIfLnurlwExistsInLnbits = async (bulkWithdraw: BulkWithdraw) => {
  const { data } = await axios.get(LNURL.decode(bulkWithdraw.lnurl))
  expect(data.minWithdrawable).toBe(AMOUNT_PER_CARD * 2 * 1000)
  expect(data.maxWithdrawable).toBe(AMOUNT_PER_CARD * 2 * 1000)
}

const checkIfCardsAreLocked = async () => {
  const cardsLocked = await callerSet.getCards({ id: SET_ID })
  expect(cardsLocked).toEqual(expect.arrayContaining([
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_0,
      isLockedByBulkWithdraw: true,
    }),
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_1,
      isLockedByBulkWithdraw: true,
    }),
  ]))
}

const checkIfLnurlRouteHandlesBulkWithdrawLock = async () => {
  let caughtError: AxiosError | undefined
  try {
    await axios.get(`${API_ORIGIN}/api/lnurl/${CARD_HASH_FUNDED_0}`)
  } catch (error) {
    if (axios.isAxiosError(error)) {
      caughtError = error
    }
  }
  expect(caughtError).toBeDefined()
  const reponseData = caughtError?.response?.data as ErrorResponse
  expect(reponseData.code).toBe(ErrorCode.CardIsLockedByBulkWithdraw)
}

const deleteBulkWithdraw = async () => {
  await callerBulkWithdraw.deleteByCardHash({ hash: CARD_HASH_FUNDED_0 })
}

const checkIfLnurlwIsRemoved = async (bulkWithdraw: BulkWithdraw) => {
  await expect(() => axios.get(LNURL.decode(bulkWithdraw.lnurl))).rejects.toThrow(Error)
}

const checkIfCardsAreReleased = async () => {
  const cardsReleased = await callerSet.getCards({ id: SET_ID })
  expect(cardsReleased).toEqual(expect.arrayContaining([
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_0,
      isLockedByBulkWithdraw: false,
    }),
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_1,
      isLockedByBulkWithdraw: false,
    }),
  ]))
}

const withdrawBulkWithdraw = async (bulkWithdraw: BulkWithdraw) => {
  const withdrawResponse = await wallet.withdrawAllFromLnurlW(bulkWithdraw.lnurl)
  expect(withdrawResponse.status).toBe('OK')
}

const checkIfBulkWithdrawIsPending = async (bulkWithdraw: BulkWithdraw) => {
  const reloadedBulkWithdraw = await callerBulkWithdraw.getById(bulkWithdraw.id)
  expect(reloadedBulkWithdraw.withdrawPending).toBe(true)
}

const sendWebhook = async (bulkWithdraw: BulkWithdraw) => {
  const webhookResponse = await axios.get(`${API_ORIGIN}/api/bulkWithdraw/withdrawn/${bulkWithdraw.id}`)
  expect(webhookResponse.data.status).toBe('success')
  expect(typeof webhookResponse.data.data.withdrawn).toBe('number')
}

const checkIfLnurlwIsWithdrawn = async (bulkWithdraw: BulkWithdraw) => {
  let caughtError: AxiosError | undefined
  try {
    await axios.get(LNURL.decode(bulkWithdraw.lnurl))
  } catch (error) {
    caughtError = error as AxiosError
  }
  expect(axios.isAxiosError(caughtError)).toBe(true)
  expect(caughtError?.response?.status).toBe(404)
  expect(caughtError?.response?.data).toEqual(
    expect.objectContaining({
      status: 'ERROR',
      reason: 'Withdraw is spent.',
    }),
  )
}

const checkIfCardsAreWithdrawn = async () => {
  const cards = await callerSet.getCards({ id: SET_ID })
  expect(cards).toEqual(expect.arrayContaining([
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_0,
      withdrawn: expect.any(Date),
    }),
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_1,
      withdrawn: expect.any(Date),
    }),
  ]))
}
