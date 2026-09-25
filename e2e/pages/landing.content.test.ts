import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import LNURL from '@shared/modules/LNURL/LNURL'

import { fundCard } from '@e2e/utils/card'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'
import { urlWithOptionalTrailingSlash } from '@e2e/utils/urlHelpers'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Landing Page', () => {
  let cardHash: string

  test.beforeAll(async () => {
    cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')
  })

  test('should load the seo preview page', async ({ page }) => {
    await page.goto('/landing')

    await expect(page.locator('[data-test="greeting-preview"]')).toBeAttached()
    await expect(page.locator('[data-test="what-is-bitcoin-cta"]')).toBeAttached()
    await expect(page.locator('[data-test="no-wallet"]')).toBeAttached()
    await expect(page.locator('[data-test="use-your-bitcoin"]')).toBeAttached()
    await expect(page.locator('[data-test="what-is-bitcoin"]')).toBeAttached()
    await expect(page.locator('[data-test="create-your-own-tip-card"]')).toBeAttached()
  })

  test('should show scroll down to "what is bitcoin" section', async ({ page }) => {
    await page.goto(`/landing/${cardHash}`)
    await page.locator('[data-test="link-what-is-bitcoin"]').click()

    await expect(page.locator('[data-test="what-is-bitcoin"]')).toBeAttached()
    await expect(page.locator('[data-test="what-is-bitcoin"]')).toBeVisible()
  })

  test('should show the "get your bitcoin" section', async ({ page }) => {
    await page.goto(`/landing/${cardHash}`)

    await expect(page.locator('[data-test="get-your-bitcoin"]')).toBeAttached()
    const walletButton = page.locator('[data-test="lightning-qr-code-button-open-in-wallet"]')
    await expect(walletButton).toHaveAttribute('href')
    const href = await walletButton.getAttribute('href')
    const lnurlEncoded = href?.split('lightning:')[1]
    if (!lnurlEncoded) {
      throw new Error('Wallet link does not contain an encoded LNURL.')
    }

    expect(LNURL.decode(lnurlEncoded)).toContain(`/api/lnurl/${cardHash}`)
  })

  test('should show the "no wallet" section', async ({ page }) => {
    await page.goto(`/landing/${cardHash}`)

    const section = page.locator('[data-test="no-wallet"]')
    await expect(section).toBeAttached()
    await expect.poll(() => section.locator('a').count()).toBeGreaterThanOrEqual(2)
  })

  test('should show the "use-your-bitcoin" section', async ({ page }) => {
    await page.goto(`/landing/${cardHash}`)

    const section = page.locator('[data-test="use-your-bitcoin"]')
    await expect(section).toBeAttached()
    await expect.poll(() => section.locator('a').count()).toBeGreaterThanOrEqual(2)
  })

  test('should show more info about bitcoin', async ({ page }) => {
    await page.goto(`/de/landing/${cardHash}`)

    await expect(page.locator('[data-test="more-bitcoin-explanation"]')).toBeAttached()
    const contents = page.locator('[data-test="collapsible-element-content"]')
    await expect.poll(() => contents.count()).toBeGreaterThanOrEqual(2)
    for (let index = 0; index < await contents.count(); index++) {
      await expect(contents.nth(index)).toBeHidden()
    }
  })

  test('should open the first extra info about bitcoin', async ({ page }) => {
    await page.goto(`/de/landing/${cardHash}`)
    await page.locator('[data-test="more-bitcoin-explanation"] button').first().click()

    await expect(page.locator('[data-test="collapsible-element-content"]').first()).toBeVisible()
  })

  test('should send the user to "home"', async ({ page }) => {
    await page.goto(`/landing/${cardHash}`)
    await page.locator('[data-test="create-your-own-tip-card"] button').click()

    await expect(page).toHaveURL(urlWithOptionalTrailingSlash('/'))
  })
})
