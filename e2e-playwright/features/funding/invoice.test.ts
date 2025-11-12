import { test, expect } from '@playwright/test'

import { payInvoice } from '@e2e-playwright/utils/lnbits/api/payments.js'
import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'

test.describe('Tipcard Invoice Funding and Withdraw', () => {
  let walletBalanceBefore: number
  const cardHash = generateTestingCardHash()

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsUserWalletApiContext, 213, 'minimal')
  })

  test.afterAll(async () => {
    // Allow for some fees
    const walletBalanceAfterMinimal = walletBalanceBefore - 3
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceAfterMinimal, 'exact')
  })

  test('fund a tipcard with payment method invoice', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/funding/${cardHash}`)

    // Fill in and submit the form
    await page.locator('[data-test="sats-amount-selector"] input').fill('210')
    await page.locator('[data-test="textmessage-text-field"] input').fill('Dev-ops E2E Test Invoice Tipcard Message')
    await page.locator('[data-test="funding-submit-button"]').click()

    // Get the invoice
    await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeVisible()
    const invoice = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
    if (!invoice) {
      throw new Error('Invoice QR code not found or empty')
    }

    // Pay the invoice using LNbits
    await payInvoice(lnbitsUserWalletApiContext, invoice)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - 213, 'exact')
  })

  test('withdraw the tipcard back to the user wallet', async ({ page }) => {
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext)
  })
})
