import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import { calculateFeeForNetAmount } from '@shared/modules/feeCalculation'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Landing Page', () => {
  test('should redirect to the funding page, if the card does not exist', async ({ page }) => {
    const cardHash = await hashSha256(crypto.randomUUID())

    await page.goto(`/landing/${cardHash}`)

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
  })

  test('should redirect to the funding page, if an unpaid invoice exists', async ({ page, request }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await request.post(
      `${process.env.BACKEND_API_ORIGIN}/api/invoice/create/${cardHash}`,
      {
        data: {
          amount: 210,
          text: 'Have fun with testing!',
        },
      },
    )
    const totalBtcInclFee = (210 + calculateFeeForNetAmount(210)) / 100_000_000

    await page.goto(`/landing/${cardHash}`)

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
    await expect(page.locator('[data-test="funding-invoice"]')).toContainText(`${totalBtcInclFee} BTC`)
  })

  test('should redirect to the funding page, if a lnurlp link for the card exists', async ({ page, request }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await request.get(`${process.env.BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`)

    await page.goto(`/landing/${cardHash}`)

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
    await expect(page.locator('[data-test="funding-lnurlp"]')).toBeAttached()
  })

  test('should redirect to the funding page, if a shared funding lnurlp link exists', async ({ page, request }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await request.post(`${process.env.BACKEND_API_ORIGIN}/api/lnurlp/create/${cardHash}`)

    await page.goto(`/landing/${cardHash}`)

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
    await expect(page.locator('[data-test="funding-shared"]')).toBeAttached()
  })

  test('should redirect to the funding page, if a set funding invoice exists', async ({ page, request }) => {
    const setId = crypto.randomUUID()
    await request.post(
      `${process.env.BACKEND_API_ORIGIN}/api/set/invoice/${setId}`,
      {
        data: {
          amountPerCard: 210,
          cardIndices: [...new Array(8).keys()],
        },
      },
    )
    const cardHash = await hashSha256(`${setId}/0`)

    await page.goto(`/landing/${cardHash}`)

    await expect(page).toHaveURL(new RegExp(`/funding/${cardHash}`))
    await expect(page.locator('[data-test="funding-set"]')).toBeAttached()
  })
})
