import { expect, test } from '@playwright/test'

import { login } from '../utils/auth/login'
import { create100TestSets } from '../utils/database/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Dashboard Cards Summary', () => {
  test('should show the preview if the user is logged out', { tag: '@parallel-safe' }, async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="cards-summary-preview"]')).toBeAttached()
  })

  test('should open the modal login', { tag: '@parallel-safe' }, async ({ page }) => {
    await page.goto('/dashboard')
    await page.locator('[data-test="dashboard-login-link"]').click()

    await expect(page.locator('[data-test="modal-login"]')).toBeAttached()
  })

  test('should show zeros if the user has no sets', { tag: '@parallel-safe' }, async ({ context, page }) => {
    await login(context)
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="cards-summary"]')).toBeAttached()
    await expect(page.locator('[data-test="cards-summary-withdrawn"]')).toContainText('0 sats')
    await expect(page.locator('[data-test="cards-summary-funded"]')).toContainText('0 sats')
    await expect(page.locator('[data-test="cards-summary-total"]')).toContainText('0 sats')
  })

  test('should show correct numbers if the user has sets', async ({ context, page }) => {
    const userId = await login(context)
    await create100TestSets(userId)
    const cardsSummaryResponse = page.waitForResponse(response => response.url().includes('card.cardsSummary'))
    await page.goto('/dashboard')
    await cardsSummaryResponse

    await expect(page.locator('[data-test="cards-summary"]')).toBeAttached()
    await expect(page.locator('[data-test="cards-summary-withdrawn"]')).toContainText('7350 sats')
    await expect(page.locator('[data-test="cards-summary-funded"]')).toContainText('19740 sats')
    await expect(page.locator('[data-test="cards-summary-total"]')).toContainText('27090 sats')
  })
})
