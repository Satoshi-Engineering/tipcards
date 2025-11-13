import { test, expect } from '@playwright/test'

import { calculateFeeForCard } from '@shared/modules/feeCalculation.js'
import { payInvoice } from '@e2e-playwright/utils/lnbits/api/payments.js'
import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'

test.describe('Tipcard Invoice Funding and Withdraw', () => {
  let walletBalanceBefore: number
  const cardHash = generateTestingCardHash()
  const cardAmount = Math.floor(Math.random() * (2100 - 210 + 1)) + 210
  const fee = calculateFeeForCard(cardAmount)
  const cardAmountInclFee = cardAmount + fee

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsUserWalletApiContext, cardAmountInclFee, 'minimal')
  })

  test.afterAll(async () => {
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - fee, 'exact')
  })

  test('fund a tipcard with payment method invoice', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/funding/${cardHash}`)

    // Fill in and submit the form
    await page.locator('[data-test="sats-amount-selector"] input').fill(`${cardAmount}`)
    await page.locator('[data-test="textmessage-text-field"] input').fill('E2E Test Invoice Tipcard Message')
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
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - cardAmountInclFee, 'exact')
  })

  test('withdraw the tipcard back to the user wallet', async ({ page }) => {
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext)
  })
})
