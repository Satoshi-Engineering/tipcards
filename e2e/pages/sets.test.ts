import { expect, test } from '@playwright/test'

import { login } from '../utils/auth/login'
import { create100TestSets } from '../utils/database/set'
import { generateAndAddSet } from '../utils/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Sets Page', () => {
  test.beforeEach(async ({ context }) => {
    await login(context)
  })

  test('User should see the empty sets list', { tag: '@parallel-safe' }, async ({ page }) => {
    const setsResponse = page.waitForResponse(response => response.url().includes('/trpc/set.getAll'))
    await page.goto('/sets')
    await setsResponse

    await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
    await expect(page.locator('[data-test="sets-list-message-not-logged-in"]')).toHaveCount(0)
    await expect(page.locator('[data-test="sets-list-message-empty"]')).toBeAttached()
  })

  test('User should access a saved set', { tag: '@parallel-safe' }, async ({ context, page }) => {
    const randomSetName = Math.random().toString(36).substring(7)
    await generateAndAddSet(context)
    await generateAndAddSet(context, randomSetName)
    const setsResponse = page.waitForResponse(response => response.url().includes('/trpc/set.getAll'))
    await page.goto('/sets')
    await setsResponse
    await page.locator('[data-test="sets-list-item"]', { hasText: randomSetName }).click()

    await expect(page).toHaveURL(/\/cards/)
    await expect(page.locator('[data-test="the-layout"]')).toContainText(randomSetName)
  })

  test('User should see logged out message after logging out', { tag: '@parallel-safe' }, async ({ context, page }) => {
    await context.clearCookies()
    const refreshResponse = await context.request.get(
      `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/trpc/auth.refreshRefreshToken`,
    )
    expect(refreshResponse.status()).toBe(401)
    await page.goto('/sets')

    await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
    await expect(page.locator('[data-test="sets-list-message-not-logged-in"]')).toBeAttached()
    await expect(page.locator('[data-test="sets-list-message-empty"]')).toHaveCount(0)
  })

  test('loads 100 sets and lists them ordered (latest changed first)', async ({ page }) => {
    const userId = await login(page.context())
    await create100TestSets(userId)
    const setsResponse = page.waitForResponse(response => response.url().includes('/trpc/set.getAll'))
    await page.goto('/sets')
    await setsResponse

    const setItems = page.locator('[data-test="sets-list-item"]')
    await expect(setItems).toHaveCount(100)
    const dates = await page.locator('[data-test="sets-list"] [data-test="sets-list-item-date"]').allTextContents()
    for (let index = 0; index < dates.length - 1; index++) {
      expect(new Date(dates[index]).getTime()).toBeGreaterThanOrEqual(new Date(dates[index + 1]).getTime())
    }
  })
})
