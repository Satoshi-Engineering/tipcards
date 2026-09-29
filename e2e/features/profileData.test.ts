import { expect, test } from '@playwright/test'

import { login } from '../utils/auth/login'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('profileData', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ context }) => {
    await login(context)
  })

  test('user navigates to account page and enters their data', async ({ page }) => {
    const profile = {
      accountName: crypto.randomUUID(),
      displayName: crypto.randomUUID(),
      email: `${crypto.randomUUID()}@example.com`,
    }
    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.goto('/user-account')
    await profileResponse

    await page.locator('[data-test="profile-form-account-name"] input').fill(profile.accountName)
    await page.locator('[data-test="profile-form-display-name"] input').fill(profile.displayName)
    await page.locator('[data-test="profile-form-email"] input').fill(profile.email)
    const updateResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.update'))
    await page.locator('[data-test="profile-form"]').evaluate((form: HTMLFormElement) => form.requestSubmit())
    await updateResponse
    await page.locator('header [data-test="the-header-main-nav-button"]').click()

    await expect(page.locator('[data-test="the-main-nav-logged-in"]')).toContainText(profile.displayName)

    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const reloadedProfileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.reload()
    await refreshResponse
    await reloadedProfileResponse

    await expect(page.locator('[data-test="profile-form-account-name"] input')).toHaveValue(profile.accountName)
    await expect(page.locator('[data-test="profile-form-display-name"] input')).toHaveValue(profile.displayName)
    await expect(page.locator('[data-test="profile-form-email"] input')).toHaveValue(profile.email)
  })
})
