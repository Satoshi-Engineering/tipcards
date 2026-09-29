import { afterAll, describe, expect, it } from 'vitest'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { Card } from '@shared/data/api/Card.js'
import { calculateFeeForGrossAmount } from '@shared/modules/feeCalculation.js'

import FailEarly from '../../FailEarly.js'
import { cardData } from '../lib/apiData.js'
import { LNBITS_ADMIN_KEY_TEST_USER_WALLET, LNBITS_ORIGIN_INTEGRATION } from '../lib/constants.js'
import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import '../lib/initAxios.js'

const CONTRIBUTION_COUNT = 6
const GROSS_AMOUNT_PER_CONTRIBUTION = 213

const cardHash = cardData.generateCardHash()
const lnurl = cardData.generateLnurl(cardHash)

const failEarly = new FailEarly(it)
const frontend = new FrontendSimulator()
const wallet = new LNBitsWallet(LNBITS_ORIGIN_INTEGRATION, LNBITS_ADMIN_KEY_TEST_USER_WALLET)

describe('sharedFunding concurrent reconciliation', () => {
  failEarly.it('should create shared funding', async () => {
    const { data } = await frontend.createSharedFunding(cardHash)

    expect(data.status).toBe('success')
  })

  failEarly.it('should accept concurrent contributions', async () => {
    const payments = await Promise.all(
      Array.from(
        { length: CONTRIBUTION_COUNT },
        () => wallet.payToLnurlP(lnurl, GROSS_AMOUNT_PER_CONTRIBUTION * 1_000),
      ),
    )

    expect(new Set(payments.map(payment => payment.payment_hash)).size).toBe(CONTRIBUTION_COUNT)
  })

  failEarly.it('should reconcile every contribution while shared funding remains open', async () => {
    const { data } = await frontend.loadCard(cardHash)
    const card = Card.parse(data.data)

    expectEveryContributionExactlyOnce(card)
    expect(card.lnurlp?.paid).toBeNull()
    expect(card.lnbitsWithdrawId).toBeNull()
  })

  failEarly.it('should finish the reconciled shared funding', async () => {
    const { data } = await frontend.finishSharedFunding(cardHash)

    expect(data.status).toBe('success')
  })

  failEarly.it('should persist every contribution exactly once', async () => {
    const { data } = await frontend.loadCard(cardHash)
    const card = Card.parse(data.data)

    expectEveryContributionExactlyOnce(card)
    expect(card.lnurlp?.paid).toEqual(expect.any(Number))
    expect(card.lnbitsWithdrawId).toEqual(expect.any(String))
  })
})

const expectEveryContributionExactlyOnce = (card: Card) => {
  const feePerContribution = calculateFeeForGrossAmount(GROSS_AMOUNT_PER_CONTRIBUTION)
  const paymentHashes = card.lnurlp?.payment_hash ?? []

  expect(card.lnurlp?.amount).toBe((GROSS_AMOUNT_PER_CONTRIBUTION - feePerContribution) * CONTRIBUTION_COUNT)
  expect(card.lnurlp?.feeAmount).toBe(feePerContribution * CONTRIBUTION_COUNT)
  expect(paymentHashes).toHaveLength(CONTRIBUTION_COUNT)
  expect(new Set(paymentHashes).size).toBe(CONTRIBUTION_COUNT)
}

afterAll(async () => {
  await wallet.withdrawAllFromLnurlW(lnurl)
})
