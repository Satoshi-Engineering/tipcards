import axios from 'axios'
import { randomUUID } from 'crypto'

import '../../initEnv'

import { BulkWithdraw } from '@shared/data/trpc/BulkWithdraw'
import { decodeLnurl } from '@shared/modules/lnurlHelpers'

import { bulkWithdrawRouter } from '@backend/trpc/router/bulkWithdraw'
import { setRouter } from '@backend/trpc/router/set'
import { TIPCARDS_API_ORIGIN } from '@backend/constants'

import Frontend from '../../frontend/Frontend'
import LNBitsWallet from '../../lightning/LNBitsWallet'
import { LNURLWithdrawRequest } from '@shared/data/LNURLWithdrawRequest'

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

const FE = new Frontend()

const AMOUNT_PER_CARD = 142

const CARD_HASH_NOT_EXISTING = FE.getCardHashBySetIdAndCardIndex(randomUUID(), 0)
const CARD_HASH_UNFUNDED = FE.getCardHashBySetIdAndCardIndex(randomUUID(), 0)
const SET_ID = randomUUID()
const CARD_HASH_FUNDED_0 = FE.getCardHashBySetIdAndCardIndex(SET_ID, 0)
const CARD_HASH_FUNDED_1 = FE.getCardHashBySetIdAndCardIndex(SET_ID, 1)

const wallet = new LNBitsWallet(process.env.LNBITS_ORIGIN || '', process.env.LNBITS_ADMIN_KEY || '')

beforeAll(async () => {
  const data = await wallet.getWalletDetails()
  if (data == null || data.balance <= AMOUNT_PER_CARD * 2 * 1000) {
    throw new Error('Not enough balance in lnbits wallet that is configured for integration tests.')
  }

  await Promise.all([
    initCard(CARD_HASH_UNFUNDED),
    initFundedCard(CARD_HASH_FUNDED_0, wallet),
    initFundedCard(CARD_HASH_FUNDED_1, wallet),
  ])
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

async function initFundedCard(cardHash: string, wallet: LNBitsWallet) {
  const invoice = await initCard(cardHash)
  const fundingResponse = await wallet.payInvoice(invoice)
  const cardResponse = await FE.loadCard(cardHash)
  if (
    fundingResponse.payment_hash.length !== 64
    || fundingResponse.checking_id.length !== 64
    || cardResponse.data.data.invoice.paid == null
    || cardResponse.data.data.lnbitsWithdrawId == null
  ) {
    throw new Error(`Funding card ${cardHash} was not successful.`)
  }
}

const createBulkWithdraw = async () => {
  const bulkWithdraw = await callerBulkWithdraw.createForCards([CARD_HASH_FUNDED_0, CARD_HASH_FUNDED_1])
  expect(bulkWithdraw.amount).toBe(AMOUNT_PER_CARD * 2)
  expect(bulkWithdraw.cards.length).toBe(2)
  return bulkWithdraw
}

const checkIfLnurlwExistsInLnbits = async (bulkWithdraw: BulkWithdraw) => {
  const { data } = await axios.get(decodeLnurl(bulkWithdraw.lnurl))
  expect(data.minWithdrawable).toBe(AMOUNT_PER_CARD * 1000)
  expect(data.maxWithdrawable).toBe(AMOUNT_PER_CARD * 1000)
}

const checkIfCardsAreLocked = async () => {
  const cardsLocked = await callerSet.getCards(SET_ID)
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

const deleteBulkWithdraw = async () => {
  await callerBulkWithdraw.deleteByCardHash(CARD_HASH_FUNDED_0)
}

const checkIfLnurlwIsRemoved = async (bulkWithdraw: BulkWithdraw) => {
  await expect(() => axios.get(decodeLnurl(bulkWithdraw.lnurl))).rejects.toThrow(Error)
}

const checkIfCardsAreReleased = async () => {
  const cardsReleased = await callerSet.getCards(SET_ID)
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
  const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(bulkWithdraw.lnurl)
  const withdrawResponse = await wallet.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
  expect(withdrawResponse.status).toBe('OK')
}

const checkIfBulkWithdrawIsPending = async (bulkWithdraw: BulkWithdraw) => {
  const reloadedBulkWithdraw = await callerBulkWithdraw.getById(bulkWithdraw.id)
  expect(reloadedBulkWithdraw.withdrawPending).toBe(true)
}

const sendWebhook = async (bulkWithdraw: BulkWithdraw) => {
  const webhookResponse = await axios.get(`${process.env.TEST_API_ORIGIN}/api/bulkWithdraw/withdrawn/${bulkWithdraw.id}`)
  expect(webhookResponse.data.status).toBe('success')
  expect(typeof webhookResponse.data.data.withdrawn).toBe('number')
}

const checkIfLnurlwIsWithdrawn = async (bulkWithdraw: BulkWithdraw) => {
  const lnurlResponse = await axios.get(decodeLnurl(bulkWithdraw.lnurl))
  expect(lnurlResponse.data).toEqual(
    expect.objectContaining({
      status: 'ERROR',
      reason: 'Withdraw is spent.',
    }),
  )
}

const checkIfCardsAreWithdrawn = async () => {
  const cards = await callerSet.getCards(SET_ID)
  expect(cards).toEqual(expect.arrayContaining([
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_0,
      withdrawn: Number,
    }),
    expect.objectContaining({
      hash: CARD_HASH_FUNDED_1,
      withdrawn: Number,
    }),
  ]))
}
