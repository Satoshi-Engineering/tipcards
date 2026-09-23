import { expect, type APIRequestContext, type BrowserContext, type Page } from '@playwright/test'

import { lnurlAuth } from '../lnbits/api/lnurlAuth'
import { createRefreshToken, createUser } from './refreshToken'

export const login = async (browserContext: BrowserContext) => {
  const { userId } = await createUser()
  await setRefreshToken(browserContext, await createRefreshToken({ userId }))
  return userId
}

export const setRefreshToken = async (browserContext: BrowserContext, refreshToken: string) => {
  const authOrigin = process.env.TIPCARDS_AUTH_ORIGIN
  if (!authOrigin) {
    throw new Error('TIPCARDS_AUTH_ORIGIN is not set')
  }

  await browserContext.addCookies([{
    name: 'refresh_token',
    value: refreshToken,
    url: authOrigin,
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  }])
}

export const ensureAtTipcardsOrigin = async (page: Page) => {
  const tipcardsOrigin = process.env.TIPCARDS_ORIGIN
  if (!tipcardsOrigin) {
    throw new Error('TIPCARDS_ORIGIN is not set')
  }

  const currentUrl = page.url()
  const currentOrigin = currentUrl ? new URL(currentUrl).origin : null

  if (currentOrigin !== new URL(tipcardsOrigin).origin) {
    await page.goto(tipcardsOrigin)
  }
}

export const loginViaUi = async ({
  page,
  lnbitsApiContext,
}: {
  page: Page
  lnbitsApiContext: APIRequestContext
}) => {
  await ensureAtTipcardsOrigin(page)
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await page.locator('[data-test="main-nav-link-login"]').click()
  await expect(page.locator('[data-test="lightning-qr-code-image"]')).toHaveAttribute(
    'href',
    /^lightning:lnurl1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]+$/i, // LNURL bech32 encoded string
  )
  const lnurl = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
  if (!lnurl) {
    throw new Error('LNURL auth link not found or empty')
  }
  await lnurlAuth(lnbitsApiContext, lnurl)

  await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
  await page.locator('[data-test="modal-login-close-button"]').click()
}
