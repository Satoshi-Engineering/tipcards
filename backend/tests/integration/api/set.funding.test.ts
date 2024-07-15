import { describe, it, expect } from 'vitest'
import axios, { AxiosError } from 'axios'
import { randomUUID } from 'crypto'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

const FE = new FrontendSimulator()

describe('set funding | create and delete', () => {
  const SET_ID = randomUUID()
  const AMOUNT_PER_CARD = 21
  const CARD_INDICES = [0,1,2,3,4,5]

  it('should create and save a new set funding invoice', async () => {
    const response = await FE.createSetFundingInvoice(SET_ID, AMOUNT_PER_CARD, CARD_INDICES)
    expect(response.data.status).toBe('success')
  })

  it('should load the set', async () => {
    const response = await FE.loadSet(SET_ID)
    expect(response.data.status).toBe('success')
    expect(response.data.data.invoice.amount).toBe(AMOUNT_PER_CARD * CARD_INDICES.length)
  })

  it('should delete the set funding invoice', async () => {
    const response = await FE.deleteSetFundingInvoice(SET_ID)
    expect(response.data.status).toBe('success')
  })

  it('should return 404 when trying to load the set again', async () => {
    let caughtError: AxiosError | undefined
    try {
      await FE.loadSet(SET_ID)
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(caughtError).not.toBeNull()
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })
})

describe('set funding | create and pay', () => {
  const SET_ID = randomUUID()
  const AMOUNT_PER_CARD = 42
  const CARD_INDICES = [0,1,2]
  const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)

  const failEarly = new FailEarly(it)

  failEarly.it('should check if lnbits wallet has enough balance for testing', async () => {
    const data = await wallet.getWalletDetails()

    expect(data).not.toBeNull()
    expect(data?.balance).toBeGreaterThanOrEqual(AMOUNT_PER_CARD * CARD_INDICES.length * 1000)
  })

  let payment_request: string

  failEarly.it('should create and save a new set funding invoice', async () => {
    const response = await FE.createSetFundingInvoice(SET_ID, AMOUNT_PER_CARD, CARD_INDICES)
    expect(response?.data.status).toBe('success')
    expect(typeof response?.data.data.invoice.payment_request).toBe('string')
    expect(response?.data.data.invoice.payment_request.startsWith('ln')).toBe(true)
    payment_request = response?.data.data.invoice.payment_request
  })

  failEarly.it('should pay the set funding invoice', async () => {
    const response = await wallet.payInvoice(payment_request)
    expect(response.payment_hash).toHaveLength(64)
    expect(response.checking_id).toHaveLength(64)
  })

  failEarly.it('should load the set', async () => {
    const response = await FE.loadSet(SET_ID)
    expect(response?.data.status).toBe('success')
    expect(typeof response?.data.data.invoice.paid).toBe('number')
  })

  failEarly.it('should load one of the cards and confirm that it is funded', async () => {
    const randomCardIndex = Math.floor(Math.random() * CARD_INDICES.length)
    const cardHash = FE.getCardHashBySetIdAndCardIndex(SET_ID, randomCardIndex)
    const response = await FE.loadCard(cardHash)
    expect(response?.data.data.setFunding.amount).toBe(AMOUNT_PER_CARD)
    expect(typeof response?.data.data.lnbitsWithdrawId).toBe('string')
  })

  failEarly.it('should successfully withdraw all cards from the set', async () => {
    await Promise.all(
      CARD_INDICES.map(async (cardIndex) => {
        const cardHash = FE.getCardHashBySetIdAndCardIndex(SET_ID, cardIndex)

        const lnurlResponse = await FE.loadLnurlForCardHash(cardHash)
        expect(lnurlResponse).not.toBeUndefined()

        const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(lnurlResponse?.data)

        const withdrawResponse = await wallet.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
        expect(withdrawResponse.status).toBe('OK')
      }),
    )
  })
})
