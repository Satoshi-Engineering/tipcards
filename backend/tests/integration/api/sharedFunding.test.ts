import { describe, it, expect, afterAll } from 'vitest'
import { randomUUID } from 'crypto'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { calculateFeeForCard } from '@shared/modules/feeCalculation.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import LNBitsWallet from '../lib/lightning/LNBitsWallet.js'
import { cardData } from '../lib/apiData.js'
import { WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY } from '../lib/constants.js'
import '../lib/initAxios.js'

const frontend = new FrontendSimulator()
const wallet = new LNBitsWallet(WALLET_LNBITS_ORIGIN, WALLET_LNBITS_ADMIN_KEY)

const AMOUNT_PER_FUNDING = 213

const cardHash = cardData.generateCardHash()
const lnurl = cardData.generateLnurl(cardHash)
const text = randomUUID()
const note = randomUUID()
const textFinish = randomUUID()
const noteFinish = randomUUID()

describe('sharedFunding', () => {
  it('should create a card shared funding', async () => {
    const { data } = await frontend.createSharedFunding(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
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
          shared: true,
          amount: null,
          feeAmount: null,
          payment_hash: null,
          id: expect.any(String),
          created: expect.any(Number),
          paid: null,
          expired: false,
        }),
        text: expect.any(String),
        note: expect.any(String),
      }),
    }))
  })

  it('should update text and note', async () => {
    const { data } = await frontend.updateSharedFunding(cardHash, text, note)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  it('should show the updated text and note', async () => {
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
          shared: true,
          amount: null,
          feeAmount: null,
          payment_hash: null,
          id: expect.any(String),
          created: expect.any(Number),
          paid: null,
          expired: false,
        }),
        text,
        note,
      }),
    }))
  })

  it('should fund a card once', async () => {
    await wallet.payToLnurlP(lnurl, AMOUNT_PER_FUNDING * 1000)
  })

  it('should show the first funding', async () => {
    const expectedFeeAmount = calculateFeeForCard(AMOUNT_PER_FUNDING)
    const expectedAmount = AMOUNT_PER_FUNDING - expectedFeeAmount

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
          shared: true,
          amount: expectedAmount,
          feeAmount: expectedFeeAmount,
          payment_hash: expect.arrayContaining([expect.any(String)]),
          id: expect.any(String),
          created: expect.any(Number),
          paid: null,
          expired: false,
        }),
        text,
        note,
      }),
    }))
  })

  it('should fund a card a second and third time, and then finish the funding', async () => {
    await wallet.payToLnurlP(lnurl, AMOUNT_PER_FUNDING * 1000)
    await wallet.payToLnurlP(lnurl, AMOUNT_PER_FUNDING * 1000)
    const { data } = await frontend.finishSharedFunding(cardHash, textFinish, noteFinish)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  it('should show the fully funded card', async () => {
    const expectedFeeAmount = calculateFeeForCard(AMOUNT_PER_FUNDING) * 3
    const expectedAmount = AMOUNT_PER_FUNDING * 3 - expectedFeeAmount

    const { data } = await frontend.loadCard(cardHash)
    expect(data).toEqual(expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        cardHash,
        invoice: null,
        setFunding: null,
        lnbitsWithdrawId: expect.any(String),
        withdrawPending: false,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
        lnurlp: expect.objectContaining({
          shared: true,
          amount: expectedAmount,
          feeAmount: expectedFeeAmount,
          payment_hash: expect.arrayContaining([expect.any(String), expect.any(String), expect.any(String)]),
          id: expect.any(String),
          created: expect.any(Number),
          paid: expect.any(Number),
          expired: false,
        }),
        text: textFinish,
        note: noteFinish,
      }),
    }))
  })
})

afterAll(async () => {
  await wallet.withdrawAllFromLnurlW(lnurl)
})
