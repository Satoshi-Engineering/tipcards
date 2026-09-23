import { expect, test } from '@playwright/test'

import { completeLogin, createLnurlAuthKeyPair } from '../../utils/auth/lnurlAuth'
import { login } from '../../utils/auth/login'
import { createUser } from '../../utils/auth/refreshToken'
import { createSetsWithSetFunding } from '../../utils/database/set'
import { generateAndAddSet } from '../../utils/set'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Sets List with sets data', () => {
  test('should login and display the user\'s sets aferwards', async ({ page }) => {
    const keyPair = createLnurlAuthKeyPair()
    const userId = (await createUser({ lnurlAuthKey: keyPair.publicKeyAsHex })).userId
    await createSetsWithSetFunding(userId, 5, 8)
    await page.goto('/dashboard')

    await page.locator('[data-test="sets-list-message-not-logged-in"] button').click()
    const link = page.locator('[data-test="modal-login"] [data-test="lightning-qr-code-image"]')
    await expect(link).toHaveAttribute('href', /^lightning:.+/)
    const lnurl = await link.getAttribute('href')
    if (!lnurl) {
      throw new Error('LNURL auth link is missing its href attribute.')
    }
    await completeLogin({ keyPair, lnurl, page })
    await page.locator('[data-test="modal-login-close-button"]').click()

    await expect(page.locator('[data-test="sets-list"] [data-test="sets-list-item"]')).toHaveCount(3)
  })

  test('loads a single set on the dashboard page', async ({ context, page }) => {
    await login(context)
    await generateAndAddSet(context)
    await page.goto('/dashboard')

    await expect(page.locator('[data-test="sets-list"] [data-test="sets-list-item"]')).toHaveCount(1)
  })

  test('loads a single set on the sets page', async ({ context, page }) => {
    await login(context)
    await generateAndAddSet(context)
    const setsResponse = page.waitForResponse(response => response.url().includes('/trpc/set.getAll'))
    await page.goto('/sets')
    await setsResponse

    await expect(page.locator('[data-test="sets-list"] [data-test="sets-list-item"]')).toHaveCount(1)
  })
})
