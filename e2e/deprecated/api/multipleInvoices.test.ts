import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Card invoices', { tag: '@parallel-safe' }, () => {
  test('should not be possible to create invoice for card with set-invoice', async ({ page, request }) => {
    const setId = crypto.randomUUID()
    await page.goto(`/set-funding/${setId}`)
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeAttached()

    const cardHash = await hashSha256(`${setId}/0`)
    const response = await request.post(
      `${process.env.BACKEND_API_ORIGIN}/api/invoice/create/${cardHash}`,
      {
        data: {
          amount: 210,
          text: 'Viel Spaß mit Bitcoin :)',
        },
      },
    )

    expect(response.status()).toBe(400)
  })

  test('should not be possible to create set-invoice for card with invoice', async ({ page, request }) => {
    const setId = crypto.randomUUID()
    const cardHash = await hashSha256(`${setId}/0`)
    await page.goto(`/funding/${cardHash}`)
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeAttached()

    const response = await request.post(
      `${process.env.BACKEND_API_ORIGIN}/api/set/invoice/${setId}`,
      {
        data: {
          amountPerCard: 210,
          cardIndices: [0, 1],
          text: 'Viel Spaß mit Bitcoin :)',
        },
      },
    )

    expect(response.status()).toBe(400)
  })
})
