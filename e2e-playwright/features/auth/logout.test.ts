import { expect, test, type Page } from '@playwright/test'

import { login } from '../../utils/auth/login'

const API_AUTH_REFRESH = `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/trpc/auth.refreshRefreshToken`
const API_SET = `${process.env.BACKEND_API_ORIGIN}/api/set`

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Feature Logout', () => {
  test.beforeEach(async ({ context }) => {
    await login(context)
  })

  test('should should log out the user', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
    await logout(page)

    await page.locator('[data-test="the-header-main-nav-button"]').click()
    await expect(page.locator('[data-test="main-nav-link-logout"]')).toHaveCount(0)
    await expectRefreshTokenCookie(page, false)

    await page.goto('/')
    await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
    await page.locator('[data-test="the-header-main-nav-button"]').click()
    await expect(page.locator('[data-test="main-nav-link-logout"]')).toHaveCount(0)
    await expectRefreshTokenCookie(page, false)
  })

  test('should remove user specific data after logout', async ({ context, page }) => {
    const randomSetName = Math.random().toString(36).substring(7)
    const accessTokenResponse = await context.request.get(API_AUTH_REFRESH)
    const accessTokenBody = await accessTokenResponse.json()
    const accessToken = accessTokenBody.result.data.json.accessToken as string
    const set = generateSet(randomSetName)
    const addSetResponse = await context.request.post(`${API_SET}/${set.id}/`, {
      data: set,
      headers: { Authorization: accessToken },
    })
    expect(addSetResponse.ok()).toBe(true)

    await page.goto('/sets')
    await expect(page.locator('[data-test="sets-list-message-not-logged-in"]')).toHaveCount(0)
    await expect(page.locator('[data-test="sets-list-item"]', { hasText: randomSetName })).toBeAttached()

    await logout(page)
    await expect(page.locator('[data-test="sets-list"]')).toBeAttached()
    await expect(page.locator('[data-test="sets-list-message-not-logged-in"]')).toBeAttached()
    await expect(page.locator('[data-test="the-layout"]')).not.toContainText(randomSetName)
    await expect(page.locator('[data-test="sets-list-message-empty"]')).toHaveCount(0)
  })
})

const logout = async (page: Page) => {
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await expect(page.locator('[data-test="main-nav-link-logout"]')).toBeAttached()
  const initialUrl = page.url()
  const logoutResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.logout'))
  await page.locator('[data-test="main-nav-link-logout"]').click()
  await logoutResponse
  await expect(page).toHaveURL(initialUrl)
}

const expectRefreshTokenCookie = async (page: Page, expected: boolean) => {
  await expect.poll(async () => {
    return (await page.context().cookies()).some(cookie => cookie.name === 'refresh_token')
  }).toBe(expected)
}

const generateSet = (setName: string) => {
  const id = crypto.randomUUID()
  const now = Math.floor(Date.now() / 1000)
  return {
    id,
    settings: {
      numberOfCards: 8,
      cardHeadline: `${id} cardHeadline`,
      cardCopytext: `${id} cardCopytext`,
      cardsQrCodeLogo: 'bitcoin',
      setName,
      landingPage: 'default',
    },
    created: now,
    date: now,
    userId: null,
    text: '',
    note: '',
    invoice: null,
  }
}
