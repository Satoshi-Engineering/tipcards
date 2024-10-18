import { describe, it, expect } from 'vitest'
import axios from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import LNURLw from '@shared/modules/LNURL/LNURLw.js'
import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import FailEarly from '../../FailEarly.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import { cardData } from '../lib/apiData.js'
import { WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'

const TEST_AMOUNT_IN_SATS = 213
const TEST_ATTEMPT_COUNT = 21

const testCard = cardData.generateCard(TEST_AMOUNT_IN_SATS)

const attackingWallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)
const frontend = new FrontendSimulator()

const failEarly = new FailEarly(it)

const createLNURLwCallbackUrls = async (attackingWallet: LNBitsWallet, lnurlWithdrawRequest: LNURLWithdrawRequest, attemptCount: number) => {
  const lnurlWCallbackUrls: string[] = []
  const amountInSats = Math.floor(lnurlWithdrawRequest.maxWithdrawable / 1000)

  for (let i = 0; i < attemptCount; i++) {
    const invoiceData = await attackingWallet.createInvoice(amountInSats, `Card: ${testCard.cardHash.substring(0, 8)}... Attempt: ${i}`)
    const invoice = invoiceData?.payment_request || ''
    const url = LNURLw.createCallbackUrl(lnurlWithdrawRequest, invoice)
    lnurlWCallbackUrls.push(url)
  }

  return lnurlWCallbackUrls
}

describe('LnBits - double spend attack - urlw extension ', () => {
  failEarly.it(`should have sufficient balance in lnbits wallet for testing (${TEST_AMOUNT_IN_SATS}sats)`, async () => {
    const data = await attackingWallet.getWalletDetails()

    expect(data).not.toBeNull()
    expect(data?.balance).toBeGreaterThanOrEqual((TEST_AMOUNT_IN_SATS * 1.1) * 1000)
  })

  failEarly.it('should create a funded card', async () => {
    const response = await frontend.createCardViaAPI(testCard.cardHash, testCard.amount, testCard.text, testCard.note)

    expect(response.data.status).toBe('success')
    expect(response.data.data).toMatch(/ln[a-z0-9]*/)

    const fundingInvoice = response.data.data

    const data = await attackingWallet.payInvoice(fundingInvoice)
    expect(data.payment_hash).toHaveLength(64)
    expect(data['checking_id']).toHaveLength(64)
  })

  it('should only once withdraw the funds of the card', async () => {
    const response = await frontend.loadLnurlForCardHash(testCard.cardHash)
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.data)
    const lnurlwCallbackUrls = await createLNURLwCallbackUrls(attackingWallet, lnurlWithdrawRequest, TEST_ATTEMPT_COUNT)
    expect(lnurlwCallbackUrls).toHaveLength(TEST_ATTEMPT_COUNT)

    let countSuccess = 0
    let countFailed = 0
    await Promise.all(lnurlwCallbackUrls.map(async (lnurlwCallbackUrl) => {
      try {
        const lnurlWithdrawResponse = await axios.get(lnurlwCallbackUrl)
        expect(lnurlWithdrawResponse.data).toEqual(expect.objectContaining({
          'status': 'OK',
        }))
        countSuccess++
      } catch {
        countFailed++
      }
    }))

    expect(countSuccess).toBe(1)
    expect(countFailed).toBe(TEST_ATTEMPT_COUNT - 1)
  }, 5000 * TEST_ATTEMPT_COUNT)
})
