import { test, expect } from '@playwright/test'

import { calculateFeeForCard } from '@shared/modules/feeCalculation.js'
import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'
import { payLnurlP } from '@e2e-playwright/utils/lnbits/api/payments'

test.describe('Tipcard LNURLp Funding and Withdraw', () => {
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

  test('fund a tipcard with payment method lnurlp', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/card/${cardHash}`)

    // Get the card's LNURL
    await expect(page.locator('[data-test="card-preview"]')).toBeVisible()
    const landingpageUrl = await page.locator('[data-test="card-preview"]').getAttribute('data-lnurl')
    if (!landingpageUrl) {
      throw new Error('Invoice QR code not found or empty')
    }
    const lnurl = extractLnurlFromUrl(landingpageUrl)

    // Pay the invoice using LNbits
    await payLnurlP(lnbitsUserWalletApiContext, lnurl, cardAmountInclFee)

    // Wait for the payment to be processed and the success QR code to appear on the funding page
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/funding/${cardHash}`)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - cardAmountInclFee, 'exact')
  })

  test('withdraw the tipcard back to the user wallet', async ({ page }) => {
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext)
  })
})

const extractLnurlFromUrl = (url: string): string => {
  const parsedUrl = new URL(url)
  const lnurl = parsedUrl.searchParams.get('lightning')
  if (!lnurl) {
    throw new Error('LNURL not found in the URL')
  }
  return lnurl
}
