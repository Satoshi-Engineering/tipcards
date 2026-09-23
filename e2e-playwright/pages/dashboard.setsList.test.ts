import { expect, test } from '@playwright/test'

import { login } from '../utils/auth/login'
import { create100TestSets } from '../utils/database/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

// generic setsList tests are found at e2e-playwright/features/setsList/*
// this group only contains dashboard page specific sets list behaviour
test.describe('Dashboard Sets List', () => {
  test('loads 100 sets and displays the 3 most recently changed (descending)', async ({ context, page }) => {
    const userId = await login(context)
    await create100TestSets(userId)
    const setsResponse = page.waitForResponse(response => response.url().includes('set.getAll'))
    await page.goto('/dashboard')
    await setsResponse

    await expect(page.locator('[data-test="sets-list"] [data-test="sets-list-item"]')).toHaveCount(3)
    const dates = await page.locator('[data-test="sets-list"] [data-test="sets-list-item-date"]').allTextContents()
    expect(new Date(dates[0]).getTime()).toBeGreaterThanOrEqual(new Date(dates[1]).getTime())
    expect(new Date(dates[1]).getTime()).toBeGreaterThanOrEqual(new Date(dates[2]).getTime())
  })

  test('only shows 3 sets on the dashboard, even if it loaded all on the sets page before', async ({ context, page }) => {
    const userId = await login(context)
    await create100TestSets(userId)
    const setsResponse = page.waitForResponse(response => response.url().includes('set.getAll'))
    await page.goto('/sets')
    await setsResponse

    const dashboardSetsResponse = page.waitForResponse(response => response.url().includes('set.getAll'))
    await page.goto('/dashboard')
    await dashboardSetsResponse

    await expect(page.locator('[data-test="sets-list-item"]')).toHaveCount(3)
  })
})
