import { expect, test } from '@playwright/test'

import { assertLoggedOutState, openLoginModal } from '../../utils/auth/authUi'
import { login } from '../../utils/auth/login'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const loggedOutMessage = '[data-test="history-list-message-not-logged-in"]'

test.describe('History list without data', () => {
  test('should render logged out state if logged out on the dashboard page, if the user is logged out', async ({ page }) => {
    await page.goto('/dashboard')

    await assertLoggedOutState(page, loggedOutMessage)
  })

  test('should render logged out state if logged out on the history page, if the user is logged out', async ({ page }) => {
    await page.goto('/history')

    await assertLoggedOutState(page, loggedOutMessage)
  })

  test('should open the modal login on the dashboard page', async ({ page }) => {
    await page.goto('/dashboard')

    await openLoginModal(page, loggedOutMessage)
  })

  test('should open the modal login on the history page', async ({ page }) => {
    await page.goto('/history')

    await openLoginModal(page, loggedOutMessage)
  })

  test('shows no-content content on the dashboard page', async ({ context, page }) => {
    await login(context)
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-message-no-items"]')).toBeAttached()
  })

  test('shows no-content content on the history page', async ({ context, page }) => {
    await login(context)
    await page.goto('/history')

    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-message-no-items"]')).toBeAttached()
  })
})
