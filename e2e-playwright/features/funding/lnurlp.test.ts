import { test, expect } from '@playwright/test'

import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateTestingCardHash, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'
import { payLnurlP } from '@e2e-playwright/utils/lnbits/api/payments'

test.describe('Tipcard LNURLp Funding and Withdraw', () => {
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
    await payLnurlP(lnbitsUserWalletApiContext, lnurl)

    // Wait for the payment to be processed and the success QR code to appear on the funding page
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/funding/${cardHash}`)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - 213, 'exact')
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
