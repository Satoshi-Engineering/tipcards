import { test, expect } from '@playwright/test'

import { calculateFeeForCard } from '@shared/modules/feeCalculation.js'
import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'
import { payLnurlP } from '@e2e-playwright/utils/lnbits/api/payments'

const generateRandomAmount = () => Math.floor(Math.random() * (2100 - 210 + 1)) + 210
const generateMultipleRandomAmounts = () => {
  const numberOfFundings = Math.floor(Math.random() * (13 - 2 + 1) + 2)
  return Array(numberOfFundings).fill(undefined).map(() => generateRandomAmount())
}

test.describe('Tipcard LNURLp Funding and Withdraw', () => {
  let walletBalanceBefore: number
  const cardHash = generateTestingCardHash()
  const fundingAmounts = generateMultipleRandomAmounts()
  const fees = fundingAmounts.map((cardAmount) => calculateFeeForCard(cardAmount))
  const cardAmounts = fundingAmounts.map((fundingAmount, i) => fundingAmount - fees[i])
  const cardAmountsTotal = cardAmounts.reduce((sum, amount) => sum + amount, 0)
  const feesTotal = fees.reduce((sum, amount) => sum + amount, 0)
  const fundingAmountsTotal = fundingAmounts.reduce((sum, amount) => sum + amount, 0)

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsUserWalletApiContext, fundingAmountsTotal, 'minimal')
  })

  test.afterAll(async () => {
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - feesTotal, 'exact')
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
    for (const fundingAmount of fundingAmounts) {
      const response = await payLnurlP(lnbitsUserWalletApiContext, lnurl, fundingAmount)
      expect(response.status).toBe('success')
    }
    await expect(page.locator('[data-test="funding-shared-total-paid"]')).toContainText(`${fundingAmountsTotal} sats`, { timeout: 60000 })
    await expect(page.locator('[data-test="funding-shared-total-on-card"]')).toContainText(`${cardAmountsTotal} sats`, { timeout: 60000 })

    // Complete the funding
    await page.locator('[data-test="textmessage-text-field"] input').fill('E2E Test Shared Tipcard Message')
    await page.locator('[data-test="note-text-field"] input').fill('E2E Test Shared Tipcard Note')
    await expect(page.locator('button[data-test="funding-shared-submit-button"]')).toBeEnabled()
    await page.locator('button[data-test="funding-shared-submit-button"]').click()

    // Wait for the payment to be processed and the success QR code to appear on the funding page
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await expect(page.locator('[data-test="card-status"][data-status="funded"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - fundingAmountsTotal, 'exact')
  })

  test('withdraw the tipcard back to the user wallet', async ({ page }) => {
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext)
  })
})
