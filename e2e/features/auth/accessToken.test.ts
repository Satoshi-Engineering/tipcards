import { expect, test } from '@playwright/test'

import { login } from '../../utils/auth/login'
import { validateAccessToken } from '../../utils/auth/refreshToken'

const API_AUTH_REFRESH = `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/trpc/auth.refreshRefreshToken`

test.describe('accessToken', () => {
  test('should not be able to get an access token, if the user is logged out', async ({ request }) => {
    const response = await request.get(API_AUTH_REFRESH)

    expect(response.status()).toBe(401)
  })

  test('should get an access token', async ({ context }) => {
    await login(context)

    const response = await context.request.get(API_AUTH_REFRESH)
    expect(response.status()).toBe(200)

    const body = await response.json()
    const accessToken = body.result.data.json.accessToken as string
    expect(accessToken).toBeTruthy()
    expect(await validateAccessToken(accessToken)).toBe(true)
  })
})
