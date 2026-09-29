import { expect, test } from '@playwright/test'

const API_PUBLIC_KEY = `${process.env.TIPCARDS_AUTH_ORIGIN}/auth/api/publicKey`

test.describe('Auth API - public Key', { tag: '@parallel-safe' }, () => {
  test('should return public key', async ({ request }) => {
    const response = await request.get(API_PUBLIC_KEY)

    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('status', 'success')
    expect(body).toHaveProperty('data')

    const publicKey = body.data as string
    const publicKeyAsLines = publicKey.split('\n')
    expect(publicKeyAsLines[0]).toBe('-----BEGIN PUBLIC KEY-----')
    expect(publicKeyAsLines.slice(-2)).toContain('-----END PUBLIC KEY-----')
  })
})
