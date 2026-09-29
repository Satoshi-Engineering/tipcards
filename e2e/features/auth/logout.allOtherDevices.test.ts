import { expect, test, type BrowserContext, type Page } from '@playwright/test'

import { login, setRefreshToken } from '../../utils/auth/login'
import { createAllowedSession, createRefreshToken, createUser } from '../../utils/auth/refreshToken'

const numberOfRefreshTokens = 4

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Feature logoutAllOtherDevices', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies()
  })

  test('should create multiple valid refresh tokens', async ({ context, page }) => {
    const refreshTokens = await createRefreshTokens(numberOfRefreshTokens)

    for (const refreshToken of refreshTokens) {
      await checkIfRefreshTokenIsValid(context, page, refreshToken)
    }
  })

  test('should invalidate all other refresh tokens on logout-all-other-devices', async ({ context, page }) => {
    const activeRefreshTokenIndex = 1
    const refreshTokens = await createRefreshTokens(numberOfRefreshTokens)
    await setRefreshToken(context, refreshTokens[activeRefreshTokenIndex])
    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.goto('/user-account')
    await refreshResponse
    await profileResponse

    const logoutResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.logoutAllOtherDevices'))
    await page.locator('[data-test="user-account-button-logout-all-other-devices"]').click()
    await logoutResponse

    for (const [index, refreshToken] of refreshTokens.entries()) {
      if (index === activeRefreshTokenIndex) {
        await checkIfRefreshTokenIsValid(context, page, refreshToken)
      } else {
        await checkIfRefreshTokenIsInvalid(context, page, refreshToken)
      }
    }
  })

  test('should show an error message if an error on the backend occurs', async ({ context, page }) => {
    await login(context)
    const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
    const profileResponse = page.waitForResponse(response => response.url().includes('/trpc/profile.get'))
    await page.goto('/user-account')
    await refreshResponse
    await profileResponse
    await page.route('**/auth/trpc/auth.logoutAllOtherDevices**', async route => {
      await route.fulfill({
        status: 500,
        json: [{
          error: {
            json: {
              message: 'Unknown error',
              code: -32603,
              data: {
                code: 'INTERNAL_SERVER_ERROR',
                httpStatus: 500,
                stack: 'Trpc Stack Trace',
                path: 'auth.logoutAllOtherDevices',
              },
            },
          },
        }],
      })
    })

    await page.locator('[data-test="user-account-button-logout-all-other-devices"]').click()

    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
    await expect(page.locator('[data-test="user-error-messages"]')).toContainText('Error while logging out all other devices')
  })
})

const createRefreshTokens = async (count: number) => {
  const { userId } = await createUser()
  return await Promise.all(Array.from({ length: count }, async () => {
    const sessionId = await createAllowedSession(userId)
    return await createRefreshToken({ sessionId, userId })
  }))
}

const checkIfRefreshTokenIsValid = async (
  context: BrowserContext,
  page: Page,
  refreshToken: string,
) => {
  await context.clearCookies()
  await setRefreshToken(context, refreshToken)
  const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
  await page.goto('/')
  await refreshResponse
  await expectRefreshTokenCookie(page, true)
}

const checkIfRefreshTokenIsInvalid = async (
  context: BrowserContext,
  page: Page,
  refreshToken: string,
) => {
  await context.clearCookies()
  await setRefreshToken(context, refreshToken)
  const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
  await page.goto('/')
  await refreshResponse
  await expectRefreshTokenCookie(page, false)
}

const expectRefreshTokenCookie = async (page: Page, expected: boolean) => {
  await expect.poll(async () => {
    return (await page.context().cookies()).some(cookie => cookie.name === 'refresh_token')
  }).toBe(expected)
}
