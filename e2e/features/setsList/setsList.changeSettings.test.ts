import { expect, test, type Page } from '@playwright/test'

import { login } from '../../utils/auth/login'
import { createSetsWithSetFunding, updateSetName } from '../../utils/database/set'
import { delayNextTrpcResponse } from '../../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const setItems = '[data-test="sets-list"] [data-test="sets-list-item"]'
const reloadingIcon = '[data-test="sets-list"] [data-test="items-list-reloading-icon"]'
const updatedSetName = 'Updated Set Name'

test.describe('Sets List with sets data', { tag: '@parallel-safe' }, () => {
  test('should update the changed set name on the dashboard page', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createOlderTestSet(userId)
    const initialSetsResponse = waitForSetsResponse(page)
    await page.goto('/sets')
    await initialSetsResponse
    await expect(page.locator(setItems)).toHaveCount(2)
    await updateSetName(testSet.id, updatedSetName)
    await delayNextTrpcResponse(page)
    const setsResponse = waitForSetsResponse(page)

    await page.locator('a[data-test="back-link-to-dashboard"]').click()

    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '1')
    await expect(page.locator(setItems).nth(1)).toContainText(testSet.settings.name)

    await setsResponse
    await expect(page.locator(setItems).first()).toContainText(updatedSetName)
    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '0')
  })

  test('should update the changed set name on the sets page', async ({ context, page }) => {
    const userId = await login(context)
    const testSet = await createOlderTestSet(userId)
    const initialSetsResponse = waitForSetsResponse(page)
    await page.goto('/dashboard')
    await initialSetsResponse
    await expect(page.locator(setItems)).toHaveCount(2)
    await updateSetName(testSet.id, updatedSetName)
    await delayNextTrpcResponse(page)
    const setsResponse = waitForSetsResponse(page)

    await page.locator('a[data-test="link-to-all-my-sets"]').click()

    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '1')
    await expect(page.locator(setItems).nth(1)).toContainText(testSet.settings.name)

    await setsResponse
    await expect(page.locator(setItems).first()).toContainText(updatedSetName)
    await expect(page.locator(reloadingIcon)).toHaveCSS('opacity', '0')
  })
})

const createOlderTestSet = async (userId: string) => {
  const sets = await createSetsWithSetFunding(userId, 2, 8)
  const testSet = sets.sort((setA, setB) => setA.changed.getTime() - setB.changed.getTime())[0]
  if (!testSet) {
    throw new Error('Expected the test sets to contain an older set.')
  }
  return testSet
}

const waitForSetsResponse = (page: Page) => page.waitForResponse(response => response.url().includes('set.getAll'))
