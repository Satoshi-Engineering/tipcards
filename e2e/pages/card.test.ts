import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import LNURL from '@shared/modules/LNURL/LNURL'

import { login } from '@e2e/utils/auth/login'
import { createSetWithCardStatusExamples } from '@e2e/utils/database/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Card Details Page', { tag: '@parallel-safe' }, () => {
  let setId: string

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    const userId = await login(context)
    const set = await createSetWithCardStatusExamples(userId)
    setId = set.id
    await context.close()
  })

  test('should show the card preview with the correct card LNURL generated', async ({ page }) => {
    await page.goto('/card/test-card-hash')

    const expectedLnurl = LNURL.encode(
      new URL('/api/lnurl/test-card-hash', process.env.BACKEND_API_ORIGIN).href,
    ).toUpperCase()
    const cardPreview = page.locator('[data-test="card-preview"]')
    await expect(cardPreview).toHaveAttribute('data-lnurl')
    const lnurl = await cardPreview.getAttribute('data-lnurl')

    expect(lnurl).not.toBeNull()
    expect(lnurl?.endsWith(`?lightning=${expectedLnurl}`)).toBe(true)
  })

  test('should show the card details page with status unfunded', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/0`)
    await page.goto(`/card/${cardHash}`)

    await expect(page.locator('[data-test="card-status-pill"]')).toHaveAttribute('data-status', 'unfunded')
    await expect(page.locator('[data-test="card-fund-button"]')).toBeAttached()
  })

  test('should show the card details page with status userActionRequired', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/3`)
    await page.goto(`/card/${cardHash}`)

    await expect(page.locator('[data-test="card-status-pill"]')).toHaveAttribute('data-status-category', 'userActionRequired')
    await expect(page.locator('[data-test="card-user-action-button"]')).toBeAttached()
  })

  test('should show the card details page with status funded', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/2`)
    await page.goto(`/card/${cardHash}`)

    await expect(page.locator('[data-test="card-status-pill"]')).toHaveAttribute('data-status-category', 'funded')
    await expect(page.locator('[data-test="card-amount-display"]')).toBeAttached()
  })

  test('should show the card details page with status withdrawn', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/1`)
    await page.goto(`/card/${cardHash}`)

    await expect(page.locator('[data-test="card-status-pill"]')).toHaveAttribute('data-status-category', 'withdrawn')
    await expect(page.locator('[data-test="card-amount-display"]')).toBeAttached()
  })
})
