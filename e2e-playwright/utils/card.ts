import { request, expect, type APIRequestContext, type Page } from '@playwright/test'
import * as z from 'zod'

import LNURL from '@shared/modules/LNURL/LNURL'

import { payInvoice, withdrawLnurlW } from '@e2e-playwright/utils/lnbits/api/payments'
import { getRandomInt } from './getRandomInt'
import { calculateFeeForNetAmount } from '@shared/modules/feeCalculation'

export const cardDynamicLnurl = (cardHash: string) => LNURL.encode(`${process.env.BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()

export const fundCard = async (cardHash: string, lnbitsApiContext: APIRequestContext) => {
  const context = await request.newContext()
  const response = await context.post(
    `${process.env.BACKEND_API_ORIGIN}/api/invoice/create/${cardHash}`,
    {
      data: {
        amount: 2100,
        text: 'Have fun with testing',
      },
    },
  )
  const { data: invoice } = z.object({
    data: z.string(),
    status: z.string(),
  }).parse(await response.json())
  await payInvoice(lnbitsApiContext, invoice)
  await expect.poll(async () => await getCardStatus(cardHash)).toBe('funded')
}

export const withdrawCard = async (cardHash: string, lnbitsApiContext: APIRequestContext) => {
  const lnurl = cardDynamicLnurl(cardHash)
  await withdrawLnurlW(lnbitsApiContext, lnurl)
  await expect.poll(async () => await getCardStatus(cardHash)).not.toBe('funded')
}

export const withdrawCardViaLandingPage = async (cardHash: string, page: Page, lnbitsApiContext: APIRequestContext, expectedAmount?: number) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)) // lnbits withdraw links have 1 second wait time

  // Go to tipcard landing page
  await page.goto(`${process.env.TIPCARDS_ORIGIN}/landing/${cardHash}`)
  await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeVisible()

  // Get the LNURL withdraw link
  await expect(page.locator('[data-test="lightning-qr-code-image"]')).toHaveAttribute('href')
  const lnurlW = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
  if (!lnurlW) {
    throw new Error('LNURL withdraw link not found or empty')
  }

  // Withdraw the tipcard to LNbits
  const { amount } = await withdrawLnurlW(lnbitsApiContext, lnurlW)
  await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })

  if (expectedAmount) {
    expect(amount).toBe(expectedAmount)
  }
}

export const getCardStatus = async (cardHash: string) => {
  const context = await request.newContext()
  const input = encodeURIComponent(JSON.stringify({ json: { hash: cardHash } }))
  const response = await context.get(`${process.env.BACKEND_API_ORIGIN}/trpc/card.status?input=${input}`)
  const { result } = z.object({
    result: z.object({
      data: z.object({
        json: z.object({
          status: z.string(),
        }),
      }),
    }),
  }).parse(await response.json())
  return result.data.json.status
}

export const generateTestingCardHash = () => {
  const cardHashPrefix = 'e2e-testing-card'
  return `${cardHashPrefix}-${crypto.randomUUID()}`
}

export const generateRandomCardFundingInfo = (minNetAmount: number, maxNetAmount: number) => {
  const netAmount = getRandomInt(minNetAmount, maxNetAmount)
  const fee = calculateFeeForNetAmount(netAmount)
  return {
    netAmount,
    fee,
    grossAmount: netAmount + fee,
  }
}

export const generateMultipleRandomCardFundingInfos = (minNumberOfFundings: number, maxNumberOfFundings: number) => {
  const numberOfFundings = getRandomInt(minNumberOfFundings, maxNumberOfFundings)
  return Array(numberOfFundings).fill(undefined).map(() => generateRandomCardFundingInfo(210, 53100))
}
