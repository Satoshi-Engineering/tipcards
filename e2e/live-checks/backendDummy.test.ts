import { expect, test } from '@playwright/test'

import { BACKEND_API_ORIGIN } from './environment'

test.describe('Backend', () => {
  test('call dummy route', async ({ request }) => {
    test.setTimeout(70_000)
    const response = await request.get(new URL('/api/dummy', BACKEND_API_ORIGIN).href, {
      timeout: 60_000,
    })

    expect(response.status()).toBe(200)
    await expect(response.json()).resolves.toMatchObject({ status: 'success' })
  })
})
