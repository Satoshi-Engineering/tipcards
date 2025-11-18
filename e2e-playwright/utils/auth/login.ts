import { expect } from '@playwright/test'
import { lnurlAuth } from '../lnbits/api/lnurlAuth'

export const loginViaUi = async ({ page, lnbitsApiContext }) => {
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await page.locator('[data-test="main-nav-link-login"]').click()
  await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeVisible()
  const lnurl = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')

  await lnurlAuth(lnbitsApiContext, lnurl)

  await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
  await page.locator('[data-test="modal-login-close-button"]').click()
}
