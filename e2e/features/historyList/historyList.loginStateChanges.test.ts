import { expect, test, type Page } from '@playwright/test'

import { completeLogin, createLnurlAuthKeyPair, type LnurlAuthKeyPair } from '../../utils/auth/lnurlAuth'
import { login } from '../../utils/auth/login'
import { createUser } from '../../utils/auth/refreshToken'
import { createSetsWithSetFunding } from '../../utils/database/set'
import { delayNextTrpcResponse } from '../../utils/trpc'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

const cardStatusItems = '[data-test="card-status-list"] [data-test="card-status-list-item"]'
const loggedOutMessage = '[data-test="history-list-message-not-logged-in"]'

test.describe('History list handling login state changes', { tag: '@parallel-safe' }, () => {
  test('should login and display the user\'s history afterwards, on the dashboard', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    const userId = await createUserForLogin(keyPair)
    await createSetsWithSetFunding(userId, 1, 8)
    await page.goto('/dashboard')

    await loginThroughHistoryMessage(page, keyPair)

    await expect(page.locator(cardStatusItems)).toHaveCount(3)
    await expect(page.locator(loggedOutMessage)).toHaveCount(0)
  })

  test('should login and display the user\'s history afterwards, on the history page', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    const userId = await createUserForLogin(keyPair)
    await createSetsWithSetFunding(userId, 1, 8)
    await page.goto('/history')

    await loginThroughHistoryMessage(page, keyPair)

    await expect(page.locator(cardStatusItems)).toHaveCount(8)
    await expect(page.locator(loggedOutMessage)).toHaveCount(0)
  })

  test('should clear the data on logout, on the dashboard', async ({ context, page }) => {
    const userId = await login(context)
    await createSetsWithSetFunding(userId, 1, 8)
    await page.goto('/dashboard')

    await expect(page.locator(cardStatusItems)).toHaveCount(3)
    await logoutViaMainNav(page)

    await expect(page.locator(loggedOutMessage)).toBeAttached()
    await expect(page.locator(cardStatusItems)).toHaveCount(0)
  })

  test('should clear the data on logout, on the history page', async ({ context, page }) => {
    const userId = await login(context)
    await createSetsWithSetFunding(userId, 1, 8)
    await page.goto('/history')

    await expect(page.locator(cardStatusItems)).toHaveCount(8)
    await logoutViaMainNav(page)

    await expect(page.locator(loggedOutMessage)).toBeAttached()
    await expect(page.locator(cardStatusItems)).toHaveCount(0)
  })

  test('should clear the data on logout, on the dashboard, even if the data loading takes longer', async ({ context, page }) => {
    const userId = await login(context)
    await createSetsWithSetFunding(userId, 1, 8)
    await delayNextTrpcResponse(page)
    await page.goto('/dashboard')

    await logoutViaMainNav(page)

    await expect(page.locator(loggedOutMessage)).toBeAttached()
    await expect(page.locator('[data-test="card-status-list"] [data-test="items-list-loading-icon--large"]')).toHaveCount(0)
    await expect(page.locator(cardStatusItems)).toHaveCount(0)
  })
})

const createUserForLogin = async (keyPair: LnurlAuthKeyPair) => {
  return (await createUser({ lnurlAuthKey: keyPair.publicKeyAsHex })).userId
}

const loginThroughHistoryMessage = async (page: Page, keyPair: LnurlAuthKeyPair) => {
  await page.locator(`${loggedOutMessage} button`).click()
  const link = page.locator('[data-test="modal-login"] [data-test="lightning-qr-code-image"]')
  await expect(link).toHaveAttribute('href', /^lightning:.+/)
  const lnurl = await link.getAttribute('href')
  if (!lnurl) {
    throw new Error('LNURL auth link is missing its href attribute.')
  }
  await completeLogin({ keyPair, lnurl, page })
  await page.locator('[data-test="modal-login-close-button"]').click()
}

const logoutViaMainNav = async (page: Page) => {
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await page.locator('[data-test="main-nav-link-logout"]').click()
}
