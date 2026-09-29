import { expect, test, type Page } from '@playwright/test'

import { login } from '../../utils/auth/login'
import { create100TestSets } from '../../utils/database/set'
import { delayNextTrpcResponse } from '../../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const cardStatusItems = '[data-test="card-status-list"] [data-test="card-status-list-item"]'
const dataLoadTimeout = 60_000

test.describe('History list loading (sorted) data', () => {
  test.beforeEach(async ({ context }) => {
    const userId = await login(context)
    await create100TestSets(userId)
  })

  test('should load and display 3 card statuses (sorted) on the dashboard page', async ({ page }) => {
    await delayNextTrpcResponse(page)
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--large"]')).toBeVisible()
    await expect(page.locator(cardStatusItems)).toHaveCount(3, { timeout: dataLoadTimeout })
    await expectCardStatusListItemsToBeSorted(page)
  })

  test('should load and display 50 card statuses (sorted) on the history page', async ({ page }) => {
    await delayNextTrpcResponse(page)
    await page.goto('/history')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--large"]')).toBeVisible()
    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })
    await expectCardStatusListItemsToBeSorted(page)
  })

  test('should display 3 card statuses and load additional data when navigating from dashboard to history page', async ({ page }) => {
    await page.goto('/dashboard')

    await expect(page.locator(cardStatusItems)).toHaveCount(3, { timeout: dataLoadTimeout })
    await delayNextTrpcResponse(page)
    await page.locator('a[data-test="link-to-full-history"]').click()

    await expect(page.locator(cardStatusItems)).toHaveCount(3)
    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--small"]')).toBeVisible()

    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })
  })

  test('should display 3 card statuses when navigating from history page to dashboard', async ({ page }) => {
    await page.goto('/history')

    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })
    await page.locator('a[data-test="back-link-to-dashboard"]').click()

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--large"]')).toHaveCount(0)
    await expect(page.locator(cardStatusItems)).toHaveCount(3, { timeout: dataLoadTimeout })
  })
})

const expectCardStatusListItemsToBeSorted = async (page: Page) => {
  const dates = await page.locator(cardStatusItems).evaluateAll(items => items.map((item) => {
    const withdrawn = item.querySelector('[data-test="card-status-list-item-date-withdrawn"]')?.textContent
    if (withdrawn) {
      return withdrawn
    }
    const bulkWithdrawCreated = item.querySelector('[data-test="card-status-list-item-date-bulkWithdrawCreated"]')?.textContent
    if (bulkWithdrawCreated) {
      return bulkWithdrawCreated
    }
    const landingPageViewed = item.querySelector('[data-test="card-status-list-item-date-landingPageViewed"]')?.textContent
    if (landingPageViewed) {
      return landingPageViewed
    }
    const funded = item.querySelector('[data-test="card-status-list-item-date-funded"]')?.textContent
    if (funded) {
      return funded
    }
    const created = item.querySelector('[data-test="card-status-list-item-date-created"]')?.textContent
    if (created) {
      return created
    }
    throw new Error('Card status list item is missing its date.')
  }))

  for (let index = 0; index < dates.length - 1; index++) {
    expect(new Date(dates[index]).getTime()).toBeGreaterThanOrEqual(new Date(dates[index + 1]).getTime())
  }
}
