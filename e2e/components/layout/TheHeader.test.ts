import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('TheHeader', () => {
  test('clicks on the lang icon in the header and the lang nav should appear and disappear', async ({ page }) => {
    await page.goto('/style-guide')

    const langNav = page.locator('header nav[data-test=the-lang-nav]')
    await expect(langNav).toHaveCount(0)
    await page.locator('header [data-test=the-header-lang-button]').first().click()
    await expect(langNav).toBeAttached()
    await expect(langNav).toContainText('English')
    await page.locator('header [data-test=the-header-close-button]').first().click()
    await expect(langNav).toHaveCount(0)
  })

  test('click on a lang nav menu item should close the lang nav', async ({ page }) => {
    await page.goto('/en/style-guide')

    const langNav = page.locator('header nav[data-test=the-lang-nav]')
    await expect(langNav).toHaveCount(0)
    await page.locator('header [data-test=the-header-lang-button]').first().click()
    await expect(langNav).toBeAttached()
    await langNav.locator('a').first().click()
    await expect(langNav).toHaveCount(0)
  })

  test('clicks on the main nav icon in the header and the main nav should appear and disappear', async ({ page }) => {
    await page.goto('/style-guide')

    const mainNav = page.locator('header nav[data-test=the-main-nav]')
    await expect(mainNav).toHaveCount(0)
    await page.locator('header [data-test=the-header-main-nav-button]').first().click()
    await expect(mainNav).toBeAttached()
    await expect(mainNav).toContainText('Home')
    await page.locator('header [data-test=the-header-close-button]').first().click()
    await expect(mainNav).toHaveCount(0)
  })

  test('click on a main nav menu item should close the main nav', async ({ page }) => {
    await page.goto('/en/style-guide')

    const mainNav = page.locator('header nav[data-test=the-main-nav]')
    await expect(mainNav).toHaveCount(0)
    await page.locator('header [data-test=the-header-main-nav-button]').first().click()
    await expect(mainNav).toBeAttached()
    await mainNav.locator('a').first().click()
    await expect(mainNav).toHaveCount(0)
  })

  test('opening the login modal via button in login banner should close the lang nav', async ({ page }) => {
    await page.goto('/sets')

    const loginButton = page.locator('header [data-test=login-banner-login]')
    await expect(loginButton).toBeAttached()
    await page.locator('header [data-test=the-header-lang-button]').first().click()
    await loginButton.first().click()

    await expect(page.locator('header nav[data-test=the-lang-nav]')).toHaveCount(0)
  })

  test('opening the login modal via button in login banner should close the main nav', async ({ page }) => {
    await page.goto('/sets')

    const loginButton = page.locator('header [data-test=login-banner-login]')
    await expect(loginButton).toBeAttached()
    await page.locator('header [data-test=the-header-main-nav-button]').first().click()
    await loginButton.first().click()

    await expect(page.locator('header nav[data-test=the-main-nav]')).toHaveCount(0)
  })
})
