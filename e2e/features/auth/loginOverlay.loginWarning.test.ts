import { expect, test } from '@playwright/test'

import {
  captureLnurlFromLinkClick,
  completeLogin,
  createLnurlAuthKeyPair,
} from '../../utils/auth/lnurlAuth'
import { createUser } from '../../utils/auth/refreshToken'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Login Overlay - Email CTA', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/')
  })

  test('After login email cta should be displayed', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    await openLoginModal(page)
    const lnurl = await captureLnurlFromLinkClick(page.locator('[data-test="lightning-qr-code-image"]'))

    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.getDisplayName'))
    await completeLogin({ keyPair, lnurl, page })
    await profileResponse

    await expect(page.locator('[data-test="emailCta"]')).toBeAttached()
  })

  test('After login email cta should not be displayed', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    await createUser({ profileEmail: 'email@domain.com', lnurlAuthKey: keyPair.publicKeyAsHex })
    await openLoginModal(page)
    const lnurl = await captureLnurlFromLinkClick(page.locator('[data-test="lightning-qr-code-image"]'))

    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.getDisplayName'))
    await completeLogin({ keyPair, lnurl, page })
    await profileResponse

    await expect(page.locator('[data-test="emailCta"]')).toHaveCount(0)
  })
})

const openLoginModal = async (page: import('@playwright/test').Page) => {
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await page.locator('[data-test="main-nav-link-login"]').click()
}
