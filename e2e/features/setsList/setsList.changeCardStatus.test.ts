import { expect, test, type Page } from '@playwright/test'

import { login } from '../../utils/auth/login'
import { createSetWithFundedCard, setFundedCardToWithdrawn } from '../../utils/database/set'
import { delayNextTrpcResponse } from '../../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const fundedCards = '[data-test="sets-list-item-cards-summary-funded"]'
const withdrawnCards = '[data-test="sets-list-item-cards-summary-withdrawn"]'
const reloadingIcon = '[data-test="sets-list"] [data-test="items-list-reloading-icon"]'

test.describe('Sets List with sets data', () => {
  test('should update a cards summary checkbox on the dashboard page', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createSetWithFundedCard(userId)
    const initialSetsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await initialSetsResponse
    await assertOldData(page)
    await setFundedCardToWithdrawn(testSet.id, 0)
    await delayNextTrpcResponse(page)
    const setsResponse = waitForSetsResponse(page)

    await page.locator('a[data-test="back-link-to-dashboard"]').click()

    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '1')
    await assertOldData(page)

    await setsResponse
    await page.locator('[data-test="sets-list"]').scrollIntoViewIfNeeded()

    await assertNewData(page)
    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '0')
  })

  test('should update a cards summary checkbox on the sets page', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createSetWithFundedCard(userId)
    const initialSetsResponse = waitForSetsResponse(page)
    await page.goto('/dashboard')
    await initialSetsResponse
    await page.locator('[data-test="sets-list"]').scrollIntoViewIfNeeded()
    await assertOldData(page)
    await setFundedCardToWithdrawn(testSet.id, 0)
    await delayNextTrpcResponse(page)
    const setsResponse = waitForSetsResponse(page)

    await page.locator('a[data-test="link-to-all-my-sets"]').click()

    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '1')
    await assertOldData(page)

    await setsResponse
    await assertNewData(page)
    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '0')
  })
})

const waitForSetsResponse = (page: Page) => page.waitForResponse(response => response.url().includes('set.getAll'))

const assertOldData = async (page: Page) => {
  await expect(page.locator(fundedCards)).toBeAttached()
  await expect(page.locator(withdrawnCards)).toHaveCount(0)
}

const assertNewData = async (page: Page) => {
  await expect(page.locator(fundedCards)).toHaveCount(0)
  await expect(page.locator(withdrawnCards)).toBeAttached()
}
