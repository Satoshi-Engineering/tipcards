import { describe, it, expect } from 'vitest'
import assert from 'assert'
import axios from 'axios'
import { randomUUID } from 'crypto'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'
import { Card } from '@shared/data/api/Card.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { API_ORIGIN, WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

const SET_ID = randomUUID()
const SATS_PER_CARD = 21
const CARD_INDEX = 0

const failEarly = new FailEarly(it)
const frontendSimulator = new FrontendSimulator()
const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)

describe('fund card and create lnurlw once', () => {
  failEarly.it('should check if lnbits wallet has enough balance for testing', async () => {
    const data = await wallet.getWalletDetails()

    expect(data).not.toBeNull()
    expect(data?.balance).toBeGreaterThanOrEqual(SATS_PER_CARD * 100)
  })

  failEarly.it('should fund a single card via set funding', async () => {
    const responseCreateInvoice = await frontendSimulator.createSetFundingInvoice(SET_ID, SATS_PER_CARD, [CARD_INDEX])
    const paymentRequest = responseCreateInvoice?.data.data.invoice.payment_request
    const response = await wallet.payInvoice(paymentRequest)
    expect(response.payment_hash).toHaveLength(64)
    expect(response.checking_id).toHaveLength(64)
  })

  failEarly.it('should create exactly one withdraw link', async () => {
    const cardHash = frontendSimulator.getCardHashBySetIdAndCardIndex(SET_ID, CARD_INDEX)
    const withdrawIds: Record<string, string> = {}

    await Promise.all([...new Array(10)].map(async () => {
      const response = await axios.get(`${API_ORIGIN}/api/card/${cardHash}`)
      const card = Card.parse(response.data.data)
      assert(typeof card.lnbitsWithdrawId === 'string')
      withdrawIds[card.lnbitsWithdrawId] = card.lnbitsWithdrawId
    }))
    expect(Object.keys(withdrawIds).length).toBe(1)
  })

  failEarly.it('should withdraw funds', async () => {
    const cardHash = frontendSimulator.getCardHashBySetIdAndCardIndex(SET_ID, CARD_INDEX)
    const lnurlResponse = await frontendSimulator.loadLnurlForCardHash(cardHash)
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(lnurlResponse?.data)
    const withdrawResponse = await wallet.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
    expect(withdrawResponse.status).toBe('OK')
  })
})
