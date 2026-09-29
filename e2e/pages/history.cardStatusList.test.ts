import { expect, test, type Page } from '@playwright/test'

import { login } from '../utils/auth/login'
import { createSetsWithSetFunding } from '../utils/database/set'
import { delayNextTrpcResponse } from '../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const cardStatusItems = '[data-test="card-status-list"] [data-test="card-status-list-item"]'
const dataLoadTimeout = 60_000

test.describe('Card status list loading (sorted) data', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ context }) => {
    const userId = await login(context)
    await createSetsWithSetFunding(userId, 5, 21)
  })

  test('should load and display 50 card statuses (sorted) on the history page', async ({ page }) => {
    await page.goto('/history')

    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })
    await expect(page.locator('[data-test="history-load-more-button"]')).toBeAttached()
    await expectCardStatusListItemsToBeSorted(page)
  })

  test('should load and display 100 card statuses (sorted) on the history page', async ({ page }) => {
    await page.goto('/history')
    await page.locator('[data-test="history-load-more-button"]').click()

    await expect(page.locator(cardStatusItems)).toHaveCount(100, { timeout: dataLoadTimeout })
    await expectCardStatusListItemsToBeSorted(page)
  })

  test('should load and display all card statuses (sorted) on the history page', async ({ page }) => {
    await page.goto('/history')
    await page.locator('[data-test="history-load-more-button"]').click()
    await expect(page.locator(cardStatusItems)).toHaveCount(100, { timeout: dataLoadTimeout })
    await page.locator('[data-test="history-load-more-button"]').click()

    await expect(page.locator(cardStatusItems)).toHaveCount(105, { timeout: dataLoadTimeout })
    await expect(page.locator('[data-test="history-load-more-button"]')).toHaveCount(0)
    await expectCardStatusListItemsToBeSorted(page)
  })

  test('should display the large loading icon, when the list has not yet loaded any items', async ({ page }) => {
    await delayNextTrpcResponse(page)
    await page.goto('/history')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--large"]')).toBeVisible()
    // Let the delayed request finish before Playwright tears down the page.
    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })
  })

  test('should display the small loading icon, when the list already has items', async ({ page }) => {
    await page.goto('/history')
    await expect(page.locator(cardStatusItems)).toHaveCount(50, { timeout: dataLoadTimeout })

    await expectSmallLoadingIconWhileLoadingNextPage(page, 100)
  })

  test('should display the small loading icon, when the list already has items and load more buttons is clicked twice', async ({ page }) => {
    await page.goto('/history')
    await page.locator('[data-test="history-load-more-button"]').click()
    await expect(page.locator(cardStatusItems)).toHaveCount(100, { timeout: dataLoadTimeout })

    await expectSmallLoadingIconWhileLoadingNextPage(page, 105)
  })
})

const expectSmallLoadingIconWhileLoadingNextPage = async (page: Page, expectedItemCount: number) => {
  let releaseRequest = () => {}
  let confirmRequestWasHeld = () => {}
  const requestWasHeld = new Promise<void>((resolve) => {
    confirmRequestWasHeld = resolve
  })
  const holdRequest = new Promise<void>((resolve) => {
    releaseRequest = resolve
  })

  await page.route('**/trpc/card.cardHistory**', async (route) => {
    confirmRequestWasHeld()
    await holdRequest
    await route.continue()
  }, { times: 1 })

  await page.locator('[data-test="history-load-more-button"]').click()
  await requestWasHeld
  try {
    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--small"]')).toBeVisible()
  } finally {
    releaseRequest()
  }
  await expect(page.locator(cardStatusItems)).toHaveCount(expectedItemCount, { timeout: dataLoadTimeout })
}

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
