import { expect, test, type Page } from '@playwright/test'

import {
  captureLnurlFromLinkClick,
  completeLogin,
  createLnurlAuthKeyPair,
} from '../../utils/auth/lnurlAuth'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Login Overlay', { tag: '@parallel-safe' }, () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies()
    await page.goto('/')
  })

  test('check if user is logged out', async ({ page }) => {
    await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
    await expect(page.locator('[data-test="logged-in"]')).toHaveCount(0)
    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
  })

  test('Close ModalLogin with close button', async ({ page }) => {
    await openLoginModal(page)
    await page.locator('[data-test="modal-login-close-button"]').click()
    await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
  })

  test('Login with click on qr code', async ({ page }) => {
    await openLoginModal(page)
    const keyPair = createLnurlAuthKeyPair()
    const lnurl = await captureLnurlFromLinkClick(page.locator('[data-test="lightning-qr-code-image"]'))
    await completeLogin({ keyPair, lnurl, page })
    await closeLoginModal(page)
    await reloadPageAndCheckAuth(page)
  })

  test('Login with lnurl from clipboard', async ({ page }) => {
    await openLoginModal(page)
    await page.evaluate(() => {
      const copiedTexts: string[] = []
      Object.assign(window, { copiedTexts })
      Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: { writeText: async (text: string) => void copiedTexts.push(text) },
      })
    })

    await page.locator('[data-test="lnurlauth-qrcode-copy-2-clipboard"]').click()
    const copiedTexts = await page.evaluate(() => (window as typeof window & { copiedTexts: string[] }).copiedTexts)
    expect(copiedTexts).toHaveLength(1)
    expect(typeof copiedTexts[0]).toBe('string')

    await completeLogin({ keyPair: createLnurlAuthKeyPair(), lnurl: copiedTexts[0], page })
    await closeLoginModal(page)
    await reloadPageAndCheckAuth(page)
  })

  test('Should login, after a login and logout has happend without reloading or revisiting the page', async ({ page }) => {
    await loginViaMainNav(page)

    await page.locator('[data-test="the-header-main-nav-button"]').click()
    const logoutResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.logout'))
    await page.locator('[data-test="main-nav-link-logout"]').click()
    await logoutResponse

    await loginViaMainNav(page)
    await reloadPageAndCheckAuth(page)
  })
})

const openLoginModal = async (page: Page) => {
  await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
  await expect(page.locator('[data-test="logged-in"]')).toHaveCount(0)
  await page.locator('[data-test="the-header-main-nav-button"]').click()
  await page.locator('[data-test="main-nav-link-login"]').click()
  await expect(page.locator('[data-test="modal-login"]')).toBeAttached()
}

const closeLoginModal = async (page: Page) => {
  await page.locator('[data-test="modal-login-close-button"]').click()
  await expect(page.locator('[data-test="modal-login"]')).toHaveCount(0)
}

const loginViaMainNav = async (page: Page) => {
  await openLoginModal(page)
  const keyPair = createLnurlAuthKeyPair()
  const link = page.locator('[data-test="modal-login"] [data-test="lightning-qr-code-image"]')
  await expect(link).toHaveAttribute('href', /^lightning:.+/)
  const lnurl = await link.getAttribute('href')
  if (!lnurl) {
    throw new Error('LNURL auth link is missing its href attribute.')
  }
  await completeLogin({ keyPair, lnurl, page })
  await closeLoginModal(page)
}

const reloadPageAndCheckAuth = async (page: Page) => {
  const refreshResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.refreshRefreshToken'))
  await page.reload()
  await refreshResponse
  await expect(page.locator('[data-test="the-layout"]')).toBeAttached()
  await expect.poll(async () => (await page.context().cookies()).some(cookie => cookie.name === 'refresh_token')).toBe(true)
}
