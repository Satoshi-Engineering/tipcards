import { expect, test } from '@playwright/test'

import { urlWithOptionalTrailingSlash } from './utils/urlHelpers.js'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('Web client', () => {
  test('visits the app root url and checks the headline', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'language', { value: 'en-US' })
      Object.defineProperty(navigator, 'languages', { value: ['en-US'] })
    })
    await page.goto('/')

    await expect(page.locator('h1')).toContainText('The easiest way to tip with Bitcoin')
  })

  test('navigates to the style-guide page and back to home', async ({ page }) => {
    await page.goto('/style-guide')
    await expect(page.locator('h1')).toContainText('Lightning TipCards Style Guide')

    await page.locator('header a').first().click()
    await expect(page).toHaveURL(urlWithOptionalTrailingSlash('/'))

    await page.goto('/en/style-guide')
    await page.locator('header a').first().click()
    await expect(page).toHaveURL(urlWithOptionalTrailingSlash('/en/'))
  })

  test('navigates to the about page', async ({ page }) => {
    await page.goto('/style-guide')
    await page.locator('footer a').first().click()

    await expect(page).toHaveURL(/\/about/)
  })

  test('navigates to satoshiengineering.com', async ({ page }) => {
    await page.goto('/style-guide')

    const externalLink = page.locator('footer a').last()
    await externalLink.evaluate((link) => link.setAttribute('target', '_self'))
    await externalLink.click()

    await expect(page).toHaveURL(/satoshiengineering\.com/)
  })

  test('navigates to the faq page via footer link', async ({ page }) => {
    await page.goto('/style-guide')
    await page.locator('[data-test="the-most-relevant-faqs"] [data-test="link-faq"]').first().click()

    await expect(page).toHaveURL(/\/faqs/)
  })

  test('clicks on second faq in most-relevant faqs', async ({ page }) => {
    await page.goto('/style-guide')

    const answers = page.locator('[data-test="the-most-relevant-faqs"] ul li p')
    const buttons = page.locator('[data-test="the-most-relevant-faqs"] ul li button')
    await expect(answers.nth(0)).toBeInViewport()
    await expect(answers.nth(1)).not.toBeInViewport()

    await buttons.nth(1).click()
    await expect(answers.nth(0)).toBeInViewport()
    await expect(answers.nth(1)).toBeInViewport()

    await buttons.nth(0).click()
    await expect(answers.nth(0)).not.toBeInViewport()
    await expect(answers.nth(1)).toBeInViewport()
  })
})
