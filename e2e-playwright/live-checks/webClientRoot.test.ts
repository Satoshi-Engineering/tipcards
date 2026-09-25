import { expect, test } from '@playwright/test'

import { TIPCARDS_ORIGIN } from './environment'

test.describe('Web client', () => {
  test('visits the app root url and checks the headline', async ({ page }) => {
    test.setTimeout(130_000)
    await page.goto(TIPCARDS_ORIGIN, { timeout: 60_000 })

    await expect(page.locator('h1')).toContainText('The easiest way to tip with Bitcoin', {
      timeout: 60_000,
    })
  })
})
