import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto(process.env.TIPCARDS_ORIGIN)
})

test('if has title', async ({ page }) => {
  await expect(page).toHaveTitle(/Lightning TipCards/)
})

test('if version is visible', async ({ page }) => {
  await expect(page.getByTestId('version')).toContainText(`Version ${process.env.npm_package_version}`)
})
