import { describe, it, expect } from 'vitest'
import axios from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'
import { Card } from '@shared/data/api/Card.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { cardData } from '../lib/apiData.js'
import { API_ORIGIN, WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

export type ExpectedCard = {
  status: string,
  data: Card,
}

const getExpectedCard = (cardHash: string, text: string, note: string, amount: number): ExpectedCard => {
  return {
    status: 'success',
    data: {
      cardHash: cardHash,
      text: text,
      note: note,
      invoice: {
        created: expect.any(Number),
        expired: false,
        amount: amount,
        paid: null,
        payment_request: '',
        payment_hash: expect.any(String),
      },
      lnurlp: null,
      setFunding: null,
      lnbitsWithdrawId: null,
      landingPageViewed: null,
      isLockedByBulkWithdraw: false,
      used: null,
      withdrawPending: false,
    },
  }
}

const setExpectedCardToEmptyCardPre = (expectedObject: ExpectedCard, fundingInvoice: string) => {
  if (expectedObject.data.invoice != null) { expectedObject.data.invoice.payment_request = fundingInvoice }
}

const setExpectedCardToEmptyCardPost = (expectedObject: ExpectedCard, created: number, payment_hash: string) => {
  if (expectedObject.data.invoice != null) { expectedObject.data.invoice.created = created }
  if (expectedObject.data.invoice != null) { expectedObject.data.invoice.payment_hash = payment_hash }
}

const setExpectedCardToFundedCardPre = (expectedObject: ExpectedCard) => {
  if (expectedObject.data.invoice != null) { expectedObject.data.invoice.paid = expect.any(Number) }
  expectedObject.data.lnbitsWithdrawId = expect.any(String)
}

const setExpectedCardToFundedCardPost = (expectedObject: ExpectedCard, paid: number, lnbitsWithdrawId: string) => {
  if (expectedObject.data.invoice != null) { expectedObject.data.invoice.paid = paid }
  expectedObject.data.lnbitsWithdrawId = lnbitsWithdrawId
}

const setExpectedCardToWithdrawPendingCardPre = (expectedObject: ExpectedCard) => {
  expectedObject.data.withdrawPending = true
}

const setExpectedCardToWithdrawnCardPre = (expectedObject: ExpectedCard) => {
  expectedObject.data.used = expect.any(Number)
  expectedObject.data.withdrawPending = false
}

const TEST_AMOUNT_IN_SATS = 200

const testCard = cardData.generateCard(TEST_AMOUNT_IN_SATS)

let fundingInvoice = ''

const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)
const failEarly = new FailEarly(it)

const frontend = new FrontendSimulator()

const EXPECTED_OBJECT = getExpectedCard(testCard.cardHash, testCard.text, testCard.note, testCard.amount)

describe('card | fund & withdraw', () => {
  failEarly.it('should check if lnbits wallet has enough balance for testing', async () => {
    const data = await wallet.getWalletDetails()

    expect(data).not.toBeNull()
    expect(data?.balance).toBeGreaterThanOrEqual(TEST_AMOUNT_IN_SATS * 1000)
  })

  failEarly.it('should create a card with valid ln invoice', async () => {
    const response = await frontend.createCardViaAPI(testCard.cardHash, testCard.amount, testCard.text, testCard.note)

    expect(response.data.status).toBe('success')
    expect(response.data.data).toMatch(/ln[a-z0-9]*/)

    fundingInvoice = response.data.data
  })

  failEarly.it('should return status of a empty (unfunded) card', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/card/${testCard.cardHash}`)

    setExpectedCardToEmptyCardPre(EXPECTED_OBJECT, fundingInvoice)

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))

    setExpectedCardToEmptyCardPost(EXPECTED_OBJECT, response.data.data.invoice.created, response.data.data.invoice.payment_hash)
  })

  failEarly.it('should pay funding invoice of card', async () => {
    const data = await wallet.payInvoice(fundingInvoice)

    expect(data.payment_hash).toHaveLength(64)
    expect(data['checking_id']).toHaveLength(64)
  })

  failEarly.it('should return status of a funded card', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/card/${testCard.cardHash}`)

    setExpectedCardToFundedCardPre(EXPECTED_OBJECT)

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))

    setExpectedCardToFundedCardPost(EXPECTED_OBJECT, response.data.data.invoice.paid, response.data.data.lnbitsWithdrawId)
  })

  failEarly.it('should withdraw the funds of the lnurlw', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/lnurl/${testCard.cardHash}`)

    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.data)

    await wallet.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
  })

  failEarly.it('should return status of a withdraw pending card', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/card/${testCard.cardHash}`)

    setExpectedCardToWithdrawPendingCardPre(EXPECTED_OBJECT)

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))
  })

  failEarly.it('should call lnurlw withdraw webhook', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/withdraw/used/${testCard.cardHash}`)
    expect(response.status).toBe(200)
  })

  failEarly.it('should return status of a withdrawn card', async () => {
    const response = await axios.get(`${API_ORIGIN}/api/card/${testCard.cardHash}`)

    setExpectedCardToWithdrawnCardPre(EXPECTED_OBJECT)

    expect(response.data).toEqual(expect.objectContaining(EXPECTED_OBJECT))
  })
})
