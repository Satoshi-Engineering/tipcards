import { expect, test } from '@playwright/test'

const TRPC_PROFILE_GET = `${process.env.BACKEND_API_ORIGIN}/trpc/profile.get`

test.describe('Feature logoutAllOtherDevices', () => {
  test('should not be able to refresh, if the user is logged out', async ({ request }) => {
    const response = await request.get(TRPC_PROFILE_GET)

    expect(response.status()).toBe(401)
  })
})
