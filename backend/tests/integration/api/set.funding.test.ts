import axios, { AxiosError } from 'axios'
import { randomUUID } from 'crypto'

import { LNURLWithdrawRequest } from '@shared/data/LNURLWithdrawRequest'

import '../initEnv'
import Frontend from '../Frontend'
import LNBitsWallet from '../lightning/LNBitsWallet'


const FE = new Frontend()

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
  // const SET_ID = '15f7cb8a-bbec-4af6-8947-ac64f74c3092'
  const SET_ID = randomUUID()
  const AMOUNT_PER_CARD = 42
  const CARD_INDICES = [0,1,2]
  const wallet = new LNBitsWallet(process.env.LNBITS_ORIGIN || '', process.env.LNBITS_ADMIN_KEY || '')

  let payment_request: string

  it('should create and save a new set funding invoice', async () => {
    const response = await FE.createSetFundingInvoice(SET_ID, AMOUNT_PER_CARD, CARD_INDICES)
    expect(response.data.status).toBe('success')
    expect(typeof response.data.data.invoice.payment_request).toBe('string')
    expect(response.data.data.invoice.payment_request.startsWith('ln')).toBe(true)
    payment_request = response.data.data.invoice.payment_request
  })

  it('should pay the set funding invoice', async () => {
    const data = await wallet.payInvoice(payment_request)
    expect(data.payment_hash).toHaveLength(64)
    expect(data.checking_id).toHaveLength(64)
  })

  it('should load the set', async () => {
    const response = await FE.loadSet(SET_ID)
    expect(response.data.status).toBe('success')
    expect(typeof response.data.data.invoice.paid).toBe('number')
  })

  it('should load one of the cards and confirm that it is funded', async () => {
    const randomCardIndex = Math.floor(Math.random() * CARD_INDICES.length)
    const cardHash = FE.getCardHashBySetIdAndCardIndex(SET_ID, randomCardIndex)
    const response = await FE.loadCard(cardHash)
    expect(response?.data.data.setFunding.amount).toBe(AMOUNT_PER_CARD)
    expect(typeof response?.data.data.lnbitsWithdrawId).toBe('string')
  })

  it('should withdraw all cards from the set', async () => {
    await Promise.all(
      CARD_INDICES.map(async (cardIndex) => {
        const cardHash = FE.getCardHashBySetIdAndCardIndex(SET_ID, cardIndex)
        const lnurlResponse = await FE.loadLnurlForCardHash(cardHash)
        const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(lnurlResponse.data)
        const withdrawResponse = await wallet.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
        expect(withdrawResponse.status).toBe('OK')
      }),
    )
  })
})

