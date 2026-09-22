import { expect, test } from '@playwright/test'

import { assertLoggedOutState, openLoginModal } from '../../utils/auth/authUi'
import { login } from '../../utils/auth/login'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const loggedOutMessage = '[data-test="sets-list-message-not-logged-in"]'

test.describe('Sets List without sets data', () => {
  test('shows a message on the dashboard page, when the user is logged out', async ({ page }) => {
    await page.goto('/dashboard')

    await assertLoggedOutState(page, loggedOutMessage)
  })

  test('shows a message on the sets page, when the user is logged out', async ({ page }) => {
    await page.goto('/sets')

    await assertLoggedOutState(page, loggedOutMessage)
  })

  test('should open the modal login on the dashboard page', async ({ page }) => {
    await page.goto('/dashboard')

    await openLoginModal(page, loggedOutMessage)
  })

  test('should open the modal login on the sets page', async ({ page }) => {
    await page.goto('/sets')

    await openLoginModal(page, loggedOutMessage)
  })

  test('shows no-content content on the dashboard page', async ({ context, page }) => {
    await login(context)
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="sets-list-message-empty"]')).toBeAttached()
  })

  test('shows no-content content on the sets page', async ({ context, page }) => {
    await login(context)
    await page.goto('/sets')

    await expect(page.locator('[data-test="sets-list-message-empty"]')).toBeAttached()
  })
})
