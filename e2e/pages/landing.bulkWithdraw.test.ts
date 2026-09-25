import { expect, test, type APIRequestContext } from '@playwright/test'
import * as z from 'zod'

import hashSha256 from '@frontend/modules/hashSha256'
import LNURL from '@shared/modules/LNURL/LNURL'

import { getCardStatus } from '@e2e/utils/card'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'
import { payInvoice } from '@e2e/utils/lnbits/api/payments'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Landing Page', () => {
  test('should show locked by bulkWithdraw', async ({ page, request }) => {
    const setId = crypto.randomUUID()
    const cardHash = await fundSet(setId, request)
    await startBulkWithdraw(cardHash, request)

    await page.goto(landingUrl(cardHash))

    await expect(page).toHaveURL(new RegExp(`/landing/${cardHash}`))
    await expect(page.locator('[data-test="greeting-is-locked-by-bulk-withdraw"]')).toBeAttached()
  })

  test('should reset a bulkWithdraw', async ({ page, request }) => {
    const setId = crypto.randomUUID()
    const cardHash = await fundSet(setId, request)
    await startBulkWithdraw(cardHash, request)

    await page.goto(landingUrl(cardHash))
    await page.locator('[data-test="reset-bulk-withdraw"]').click()

    await expect(page).toHaveURL(new RegExp(`/landing/${cardHash}`))
    await expect(page.locator('[data-test="greeting-funded-headline"]')).toBeAttached()
    await expect(page.locator('[data-test="greeting-funded-bitcoin-amount"]')).toContainText('0.00000210 BTC')
  })
})

const fundSet = async (setId: string, request: APIRequestContext) => {
  const invoiceResponse = await request.post(
    `${process.env.BACKEND_API_ORIGIN}/api/set/invoice/${setId}`,
    {
      data: {
        amountPerCard: 210,
        cardIndices: [...new Array(8).keys()],
      },
    },
  )
  const body = z.object({
    data: z.object({
      invoice: z.object({
        payment_request: z.string(),
      }),
    }),
  }).parse(await invoiceResponse.json())
  await payInvoice(lnbitsTestUserWalletApiContext, body.data.invoice.payment_request)
  await request.post(`${process.env.BACKEND_API_ORIGIN}/api/set/invoice/paid/${setId}`)

  const cardHash = await hashSha256(`${setId}/0`)
  await expect.poll(() => getCardStatus(cardHash)).toBe('funded')
  return cardHash
}

const startBulkWithdraw = async (cardHash: string, request: APIRequestContext) => {
  const response = await request.post(
    `${process.env.BACKEND_API_ORIGIN}/trpc/bulkWithdraw.createForCards`,
    {
      data: { json: [cardHash] },
    },
  )
  expect(response.ok()).toBe(true)
}

const landingUrl = (cardHash: string) => {
  const lnurl = LNURL.encode(`${process.env.TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`).toUpperCase()
  return `/landing?lightning=${lnurl}`
}
