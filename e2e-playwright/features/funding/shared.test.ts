import { test, expect } from '@playwright/test'

import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateMultipleRandomCardFundingInfos, generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'
import { payLnurlP } from '@e2e-playwright/utils/lnbits/api/payments'

test.describe('Tipcard LNURLp Funding and Withdraw', () => {
  let walletBalanceBefore: number
  const cardHash = generateTestingCardHash()

  const cardFundingInfos = generateMultipleRandomCardFundingInfos(2, 27)

  const netAmountOnCard = cardFundingInfos.reduce((sum, { netAmount }) => sum + netAmount, 0)
  const grossAmountsTotal = cardFundingInfos.reduce((sum, { grossAmount }) => sum + grossAmount, 0)
  const totalFee = cardFundingInfos.reduce((sum, { fee }) => sum + fee, 0)

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsUserWalletApiContext, grossAmountsTotal, 'minimal')
  })

  test.afterAll(async () => {
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - totalFee, 'exact', true)
  })

  test('fund a tipcard with payment method lnurlp', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/funding/${cardHash}`)
    await page.locator('[data-test="funding-make-shared-button"]').click()

    // Get the card's LNURL
    await expect(page.locator('[data-test="funding-shared"]')).toBeVisible()
    const lnurl = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
    if (!lnurl) {
      throw new Error('Invoice QR code not found or empty')
    }

    // Pay the invoice multiple times using LNbits
    for (const cardFundingInfo of cardFundingInfos) {
      const response = await payLnurlP(lnbitsUserWalletApiContext, lnurl, cardFundingInfo.grossAmount)
      expect(response.status).toBe('success')
    }
    await expect(page.locator('[data-test="funding-shared-total-paid"]')).toContainText(`${grossAmountsTotal} sats`, { timeout: 60000 })
    await expect(page.locator('[data-test="funding-shared-total-on-card"]')).toContainText(`${netAmountOnCard} sats`, { timeout: 60000 })

    // Complete the funding
    await page.locator('[data-test="textmessage-text-field"] input').fill('E2E Test Shared Tipcard Message')
    await page.locator('[data-test="note-text-field"] input').fill('E2E Test Shared Tipcard Note')
    await expect(page.locator('button[data-test="funding-shared-submit-button"]')).toBeEnabled()
    await page.locator('button[data-test="funding-shared-submit-button"]').click()

    // Wait for the payment to be processed and the success QR code to appear on the funding page
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - grossAmountsTotal, 'exact', true)
  })

  test('withdraw the tipcard back to the user wallet', async ({ page }) => {
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext, netAmountOnCard)
  })
})
