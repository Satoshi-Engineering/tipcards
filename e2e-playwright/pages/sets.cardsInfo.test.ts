import { expect, test, type Page } from '@playwright/test'

import { createRefreshToken, createUser } from '../utils/auth/refreshToken'
import { setRefreshToken } from '../utils/auth/login'
import { createSetsWithSetFunding } from '../utils/database/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const numberOfSets = 100
const numberOfCardsPerSet = 100
const viewportHeight = 660
const setsListItems = '[data-test="sets-list-item"]'
const userActionRequiredItems = '[data-test="sets-list-item-cards-summary-userActionRequired"]'

test.describe('Sets Page Cards Info', () => {
  let refreshToken = ''

  test.beforeAll(async () => {
    const { userId } = await createUser()
    refreshToken = await createRefreshToken({ userId })
    await createSetsWithSetFunding(userId, numberOfSets, numberOfCardsPerSet)
  })

  test.beforeEach(async ({ context }) => {
    await setRefreshToken(context, refreshToken)
  })

  test(`loads ${numberOfSets} sets with ${numberOfCardsPerSet} cards each`, async ({ page }) => {
    const setsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await setsResponse

    await expect(page.locator(setsListItems)).toHaveCount(numberOfSets)
  })

  test('loads only cards info for sets in viewport', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page)
    const cardsInfoResponse = waitForCardsInfoResponse(page)
    await page.goto('/sets')
    await setsResponse
    await cardsInfoResponse

    const expectedCardsPerSet = Math.min(12, numberOfCardsPerSet)
    await expect.poll(() => page.locator(userActionRequiredItems).count()).toBeGreaterThanOrEqual(4 * expectedCardsPerSet)
    await expectSetListItemsInViewportToHaveCardsInfo(page, expectedCardsPerSet)

    expect(await page.locator(userActionRequiredItems).count()).toBeLessThanOrEqual(4 * expectedCardsPerSet)
  })

  test('loads cards info for sets in viewport after scrolling', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page)
    const cardsInfoResponse = waitForCardsInfoResponse(page)
    await page.goto('/sets')
    await setsResponse
    await cardsInfoResponse

    await scrollDownAndWaitForCardsInfoResponse(page)

    const expectedCardsPerSet = Math.min(12, numberOfCardsPerSet)
    await expect.poll(() => page.locator(userActionRequiredItems).count()).toBeGreaterThanOrEqual(7 * expectedCardsPerSet)
    await expectSetListItemsInViewportToHaveCardsInfo(page, expectedCardsPerSet)
  })

  test('does only load cards info for sets that have been in viewport before and after scrolling', async ({ page }) => {
    const setsResponse = waitForSetsResponse(page)
    const cardsInfoResponse = waitForCardsInfoResponse(page)
    await page.goto('/sets')
    await setsResponse
    await cardsInfoResponse
    await scrollDownAndWaitForCardsInfoResponse(page)

    expect(await page.locator(userActionRequiredItems).count()).toBeLessThan(numberOfSets * Math.min(12, numberOfCardsPerSet))
  })
})

const waitForSetsResponse = (page: Page) => page.waitForResponse(response => response.url().includes('set.getAll'))

const waitForCardsInfoResponse = (page: Page) => page.waitForResponse(
  response => response.url().includes('set.getCardsSummaryForSetId'),
)

const scrollDownAndWaitForCardsInfoResponse = async (page: Page) => {
  const cardsInfoResponse = waitForCardsInfoResponse(page)
  const setItems = page.locator(setsListItems)
  await setItems.nth(await setItems.count() - 3).scrollIntoViewIfNeeded()
  await cardsInfoResponse
}

const expectSetListItemsInViewportToHaveCardsInfo = async (page: Page, expectedCardsPerSet: number) => {
  await expect.poll(async () => {
    const cardsInfoCounts = await page.locator(setsListItems).evaluateAll((items, height) => items
      .filter((item) => {
        const rect = item.getBoundingClientRect()
        return rect.bottom >= 0 && rect.top <= height
      })
      .map(item => item.querySelectorAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length), viewportHeight)

    return cardsInfoCounts.length > 0
      && cardsInfoCounts.every(cardsInfoCount => cardsInfoCount === expectedCardsPerSet)
  }).toBe(true)
}
