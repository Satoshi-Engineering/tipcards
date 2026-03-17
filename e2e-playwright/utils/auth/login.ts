import { expect } from '@playwright/test'

import { lnurlAuth } from '../lnbits/api/lnurlAuth'

export const ensureAtTipcardsOrigin = async (page) => {
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

export const loginViaUi = async ({ page, lnbitsApiContext }) => {
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
