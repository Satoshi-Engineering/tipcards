import { expect, test } from '@playwright/test'

import { login } from '../../utils/auth/login'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Refresh token', () => {
  test('should do nothing if none exists', async ({ page }) => {
    await page.goto('/sets')

    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
    await expect(page.locator('[data-test="the-login-banner"]')).toBeAttached()
  })

  test('should do nothing if logged in', async ({ context, page }) => {
    await login(context)
    await page.goto('/sets')

    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
    await expect(page.locator('[data-test="the-login-banner"]')).toHaveCount(0)
  })
})
