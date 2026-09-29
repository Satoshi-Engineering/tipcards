import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('aboutPageLinks', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('should navigate to the cards page when the create button is clicked', async ({ page }) => {
    const createButton = page.locator('[data-test="hero-section"] [data-test="button-create"]')
    await expect(createButton).toBeAttached()
    await createButton.click()

    await expect(page).toHaveURL(/cards/)
  })

  test('should navigate to github when the button in the open source section is clicked', async ({ page }) => {
    const openSourceButton = page.locator('[data-test=button-open-source]').first()
    await expect(openSourceButton).toBeAttached()
    await expect(openSourceButton).toHaveAttribute('target', '_blank')
    await expect(openSourceButton).toHaveAttribute('href', /github/)
    await openSourceButton.evaluate((link) => link.setAttribute('target', '_self'))
    await openSourceButton.click()

    await expect(page).toHaveURL(/github\.com.*tipcards/i)
  })

  test('should render a button href in the license section with a href pointing to the license on github', async ({ page }) => {
    const licenseButton = page.locator('[data-test=button-license]').first()
    await expect(licenseButton).toBeAttached()
    await expect(licenseButton).toHaveAttribute('target', '_blank')
    await expect(licenseButton).toHaveAttribute('href', /github/)
    await expect(licenseButton).toHaveAttribute('href', /tipcards/)
    await expect(licenseButton).toHaveAttribute('href', /LICENSE/)
  })
})
