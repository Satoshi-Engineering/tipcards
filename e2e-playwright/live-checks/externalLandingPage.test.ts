import { expect, test } from '@playwright/test'

import { FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE } from './environment'

test.describe('External landing page', () => {
  test('check if the funded card is loaded', async ({ page }) => {
    test.setTimeout(130_000)
    await page.goto(FUNDED_CARD_ON_EXTERNAL_LANDING_PAGE, { timeout: 60_000 })

    await expect(page.getByText('You can collect your Lightning tip worth 0.00000210 Bitcoin here.')).toBeAttached({
      timeout: 60_000,
    })
  })
})
