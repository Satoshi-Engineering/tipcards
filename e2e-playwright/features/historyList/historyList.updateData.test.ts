import { expect, test, type Page } from '@playwright/test'

import { login } from '../../utils/auth/login'
import { createHistoryUpdateTestData, setFundedCardToLandingPageViewed } from '../../utils/database/set'
import { delayNextTrpcResponse } from '../../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const cardStatusItems = '[data-test="card-status-list-item"]'
const landingPageViewedDate = '[data-test="card-status-list-item-date-landingPageViewed"]'

test.describe('History list without data', () => {
  test('should refresh when navigating from dashboard to history page', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createHistoryUpdateTestData(userId)
    await page.goto('/dashboard')
    await expect(page.locator(cardStatusItems)).toHaveCount(3)
    await setFundedCardToLandingPageViewed(testSet.id, 2)
    await delayNextTrpcResponse(page)

    await page.locator('a[data-test="link-to-full-history"]').click()

    await assertOldData(page, 3)
    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--small"]')).toBeVisible()

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--small"]')).toHaveCount(0)
    await assertNewData(page, 4)
  })

  test('should refresh when navigating from history page to dashboard', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createHistoryUpdateTestData(userId)
    await page.goto('/history')
    await expect(page.locator(cardStatusItems)).toHaveCount(4)
    await setFundedCardToLandingPageViewed(testSet.id, 2)
    await delayNextTrpcResponse(page)

    await page.locator('a[data-test="back-link-to-dashboard"]').click()

    await assertOldData(page, 3)
    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-reloading-icon"]')).toHaveCSS('opacity', '1')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-reloading-icon"]')).toHaveCSS('opacity', '0')
    await assertNewData(page, 3)
  })
})

const assertOldData = async (page: Page, expectedCount: number) => {
  await expect(page.locator(cardStatusItems)).toHaveCount(expectedCount)
  await expect(page.locator(landingPageViewedDate)).toHaveCount(0)
}

const assertNewData = async (page: Page, expectedCount: number) => {
  await expect(page.locator(cardStatusItems)).toHaveCount(expectedCount)
  await expect(page.locator(cardStatusItems).first().locator(landingPageViewedDate)).toBeVisible()
}
