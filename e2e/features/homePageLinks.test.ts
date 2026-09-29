import { expect, test } from '@playwright/test'

test.use({ viewport: { width: 1000, height: 660 } })

test.describe('homePageLinks', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to the cards page when the create button is clicked', async ({ page }) => {
    const createButton = page.locator('[data-test="hero-section"] [data-test="button-create"]')
    await expect(createButton).toBeAttached()
    await createButton.click()

    await expect(page).toHaveURL(/cards/)
  })

  test('should navigate to the dashboard page when the dashboard button is clicked', async ({ page }) => {
    const dashboardButton = page.locator('[data-test="hero-section"] [data-test="button-dashboard"]')
    await expect(dashboardButton).toBeAttached()
    await dashboardButton.click()

    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should render the two expected sliders', async ({ page }) => {
    await expect(page.locator('[data-test=slider-how-it-works]')).toBeAttached()
    await expect(page.locator('[data-test=slider-video-guides]')).toBeAttached()
  })

  test('should navigate to the cards page when the button in the first slider is clicked', async ({ page }) => {
    await page.locator('[data-test="slider-how-it-works"] [data-test="slider-button-start"]').first().click()

    await expect(page).toHaveURL(/\/cards/)
  })

  test("should contain a link to the youtube video in the second slider's play button", async ({ page }) => {
    const videoLink = page.locator('[data-test="slider-video-guides"] [data-test="slider-video-link"]').nth(0)
    await expect(videoLink).toBeAttached()
    await expect(videoLink).toHaveAttribute('target', '_blank')
    await expect(videoLink).toHaveAttribute('href', /https:\/\/www\.youtube\.com/)
  })
})
