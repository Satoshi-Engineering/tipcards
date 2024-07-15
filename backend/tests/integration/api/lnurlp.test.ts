import { describe, it, expect, afterAll } from 'vitest'
import axios, { AxiosError } from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { cardData } from '../lib/apiData.js'
import { WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'

const frontend = new FrontendSimulator()
const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)

const cardHash = cardData.generateCardHash()
describe('lnurlp without funding', () => {
  it('should create a card when the lnurl link is used directly', async () => {
    const { data } = await frontend.loadLnurlForCardHash(cardHash)
    expect(data).toEqual(expect.objectContaining({
      tag: 'payRequest',
    }))
  })

  it('should be visible in the card status', async () => {
    const { data } = await frontend.loadCard(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        cardHash,
        invoice: null,
        setFunding: null,
        lnbitsWithdrawId: null,
        withdrawPending: false,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
        lnurlp: expect.objectContaining({
          shared: false,
          amount: null,
          payment_hash: null,
          id: expect.any(String),
          created: expect.any(Number),
          paid: null,
          expired: false,
        }),
      }),
    }))
  })

  it('should be able to delete the card', async () => {
    const { data } = await frontend.deleteCard(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  it('should return 404 after the card was deleted', async () => {
    let caughtError: AxiosError | undefined = undefined
    try {
      await frontend.loadCard(cardHash)
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })
})

const cardHashForCardWithFunding = cardData.generateCardHash()
const lnurlForCardWithFunding = cardData.generateLnurl(cardHashForCardWithFunding)
describe('lnurlp with funding', () => {
  it('should fund a card', async () => {
    await wallet.payToLnurlP(lnurlForCardWithFunding)
  })

  it('should be visible in the card status', async () => {
    const { data } = await frontend.loadCard(cardHashForCardWithFunding)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        cardHash: cardHashForCardWithFunding,
        invoice: null,
        setFunding: null,
        lnbitsWithdrawId: expect.any(String),
        withdrawPending: false,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
        lnurlp: expect.objectContaining({
          shared: false,
          amount: expect.any(Number),
          payment_hash: expect.arrayContaining([expect.any(String)]),
          id: expect.any(String),
          created: expect.any(Number),
          paid: expect.any(Number),
          expired: false,
        }),
      }),
    }))
  })
})

afterAll(async () => {
  await wallet.withdrawAllFromLnurlW(lnurlForCardWithFunding)
})
