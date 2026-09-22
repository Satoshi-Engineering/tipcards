import { expect, test, type BrowserContext, type Page } from '@playwright/test'

import { login, setRefreshToken } from '../../utils/auth/login'
import {
  generateExpiringAccessToken,
  generateInvalidRefreshToken,
  logoutAllDevices,
} from '../../utils/auth/refreshToken'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Revoked/denied refresh token', () => {
  test('should show modal login with logged out by other device error message', async ({ context, page }) => {
    await login(context)
    await logoutAllDevices(await getRefreshToken(context))

    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    await page.goto('/')
    await refreshResponse

    await expectLoginMessage(page, 'You logged out on another device')
  })

  test('should show nothing if the user is logged out', async ({ context, page }) => {
    await login(context)
    await logoutAllDevices(await getRefreshToken(context))
    const revokedRefreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    await page.goto('/')
    await revokedRefreshResponse

    const missingRefreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    await page.reload()
    await missingRefreshResponse

    await expectRefreshTokenCookie(page, false)
    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
  })

  test('should show modal login with generic error message', async ({ context, page }) => {
    await login(context)
    const refreshToken = await getRefreshToken(context)
    await setRefreshToken(context, await generateInvalidRefreshToken(refreshToken))

    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    await page.goto('/')
    await refreshResponse

    await expectLoginMessage(page, 'You were logged out')
  })

  test('should show modal login, if user logged out on another device while using application', async ({ context, page }) => {
    await login(context)
    const refreshToken = await getRefreshToken(context)
    const accessToken = await generateExpiringAccessToken(refreshToken)
    await page.route('**/auth/trpc/auth.refreshRefreshToken**', async route => {
      await route.fulfill({
        json: [{ result: { data: { json: { accessToken } } } }],
      })
    }, { times: 1 })
    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const setResponse = page.waitForResponse(response => response.url().includes('/api/set/'))
    await page.goto('/cards')
    await refreshResponse
    await setResponse
    await expect(page.locator('button[data-test="save-cards-set"]')).toBeVisible()
    await page.waitForTimeout(10_000)
    await logoutAllDevices(refreshToken)

    await page.locator('button[data-test="save-cards-set"]').click()

    await expectLoginMessage(page, 'You logged out on another device')
  })

  test('should show modal login, if user logged out on another device and wants to use the log out all other devices feature', async ({ context, page }) => {
    await login(context)
    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.goto('/user-account')
    await refreshResponse
    await profileResponse
    await logoutAllDevices(await getRefreshToken(context))

    const logoutResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.logoutAllOtherDevices'))
    await page.locator('[data-test="user-account-button-logout-all-other-devices"]').click()
    await logoutResponse

    await expectLoginMessage(page, 'You logged out on another device')
  })

  test('should show modal login with generic error message, if user clicked log out all other devices but has no valid refresh token', async ({ context, page }) => {
    await login(context)
    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.goto('/user-account')
    await refreshResponse
    await profileResponse
    const refreshToken = await getRefreshToken(context)
    await setRefreshToken(context, await generateInvalidRefreshToken(refreshToken))

    const logoutResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.logoutAllOtherDevices'))
    await page.locator('[data-test="user-account-button-logout-all-other-devices"]').click()
    await logoutResponse

    await expectLoginMessage(page, 'You were logged out')
  })
})

const getRefreshToken = async (context: BrowserContext) => {
  const cookie = (await context.cookies()).find(({ name }) => name === 'refresh_token')
  if (!cookie) {
    throw new Error('Refresh token cookie is missing.')
  }
  return cookie.value
}

const expectLoginMessage = async (page: Page, message: string) => {
  await expect(page.locator('[data-test="modal-login"]')).toBeAttached()
  await expect(page.locator('[data-test="modal-login-user-message"]')).toContainText(message)
}

const expectRefreshTokenCookie = async (page: Page, expected: boolean) => {
  await expect.poll(async () => {
    return (await page.context().cookies()).some(cookie => cookie.name === 'refresh_token')
  }).toBe(expected)
}
