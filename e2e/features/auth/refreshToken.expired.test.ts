import { expect, test } from '@playwright/test'

import { login, setRefreshToken } from '../../utils/auth/login'
import { generateExpiredRefreshToken } from '../../utils/auth/refreshToken'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Expired refresh token', { tag: '@parallel-safe' }, () => {
  test('should show modal login with session expiration message', async ({ context, page }) => {
    await login(context)
    const refreshToken = await getRefreshToken(context)
    await setRefreshToken(context, await generateExpiredRefreshToken(refreshToken))

    await page.goto('/')

    await expect(page.locator('[data-test="modal-login"]')).toBeAttached()
    await expect(page.locator('[data-test="modal-login-user-message"]')).toContainText('Your login expired')
  })
})

const getRefreshToken = async (context: import('@playwright/test').BrowserContext) => {
  const cookie = (await context.cookies()).find(({ name }) => name === 'refresh_token')
  if (!cookie) {
    throw new Error('Refresh token cookie is missing.')
  }
  return cookie.value
}
