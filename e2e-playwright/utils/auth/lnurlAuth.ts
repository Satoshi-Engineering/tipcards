import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test'

import HDWallet from '@shared/modules/HDWallet/HDWallet'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth'

import { removeLightningPrefix } from '../removeLightningPrefix'

export type LnurlAuthKeyPair = {
  privateKeyAsHex: string
  publicKeyAsHex: string
}

export const createLnurlAuthKeyPair = (): LnurlAuthKeyPair => {
  const signingKey = HDWallet.generateRandomNode()
  return {
    privateKeyAsHex: signingKey.getPrivateKeyAsHex(),
    publicKeyAsHex: signingKey.getPublicKeyAsHex(),
  }
}

export const getLnurlAuthCallbackUrl = (lnurl: string, keyPair: LnurlAuthKeyPair) => {
  return new LNURLAuth(keyPair).getLNURLAuthCallbackUrl(removeLightningPrefix(lnurl)).href
}

export const performLnurlAuth = async (
  request: APIRequestContext,
  lnurl: string,
  keyPair: LnurlAuthKeyPair,
) => {
  const callbackUrl = getLnurlAuthCallbackUrl(lnurl, keyPair)
  const response = await request.get(callbackUrl)
  expect(response.status()).toBe(200)
  return callbackUrl
}

export const captureLnurlFromLinkClick = async (link: Locator) => {
  await expect(link).toHaveAttribute('href', /^lightning:.+/)
  await link.evaluate((element: HTMLAnchorElement) => {
    element.addEventListener('click', event => event.preventDefault(), { once: true })
  })
  const href = await link.getAttribute('href')
  if (!href) {
    throw new Error('LNURL auth link is missing its href attribute.')
  }
  await link.click()
  return removeLightningPrefix(href)
}

export const completeLogin = async ({
  keyPair,
  lnurl,
  page,
}: {
  keyPair: LnurlAuthKeyPair
  lnurl: string
  page: Page
}) => {
  const loginResponse = page.waitForResponse(response => response.url().includes('/auth/trpc/auth.loginWithLnurlAuthHash'))
  await performLnurlAuth(page.request, lnurl, keyPair)
  await loginResponse
  await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60_000 })
}
