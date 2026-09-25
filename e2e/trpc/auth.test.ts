import { expect, test } from '@playwright/test'

import {
  createLnurlAuthKeyPair,
  getLnurlAuthCallbackUrl,
} from '../utils/auth/lnurlAuth'

const API_AUTH_REFRESH = `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/trpc/auth.refreshRefreshToken`

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Trpc Auth', () => {
  test('should not be able to refresh, if the user is logged out', async ({ request }) => {
    const response = await request.get(API_AUTH_REFRESH)

    expect(response.status()).toBe(401)
  })

  test('Lnurl auth callback url call should fail, after a login has happend', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    await page.goto('/')
    await page.locator('[data-test="the-header-main-nav-button"]').click()
    await page.locator('[data-test="main-nav-link-login"]').click()
    const link = page.locator('[data-test="lightning-qr-code-button-open-in-wallet"]')
    await expect(link).toHaveAttribute('href')
    const lnurl = await link.getAttribute('href')
    if (!lnurl) {
      throw new Error('LNURL auth link is missing its href attribute.')
    }

    const callbackUrl = getLnurlAuthCallbackUrl(lnurl, keyPair)
    const loginResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.loginWithLnurlAuthHash'))
    const firstResponse = await page.request.get(callbackUrl)
    expect(firstResponse.status()).toBe(200)
    await loginResponse

    const secondResponse = await page.request.get(callbackUrl)
    expect(secondResponse.status()).toBe(400)
  })
})
