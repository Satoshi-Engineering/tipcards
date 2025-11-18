import { test, expect } from '@playwright/test'

import { payInvoice, withdrawLnurlW } from '@e2e-playwright/utils/lnbits/api/payments.js'
import { getAndCheckWalletBalance } from '@e2e-playwright/utils/lnbits/api/wallet.js'
import { lnbitsUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { generateRandomCardFundingInfo, withdrawCardViaLandingPage } from '@e2e-playwright/utils/card.js'
import { getRandomInt } from '@e2e-playwright/utils/getRandomInt'
import hashSha256 from '@frontend/modules/hashSha256'
import { loginViaUi } from '@e2e-playwright/utils/auth/login'

test.describe('Tipcard Set Funding', () => {
  let walletBalanceBefore: number
  const setId = crypto.randomUUID()
  let fullSetUrl = ''
  const numberOfCards = getRandomInt(2, 50)
  const { netAmount, grossAmount, fee } = generateRandomCardFundingInfo(210, 2100)
  const totalGrossAmount = grossAmount * numberOfCards
  const totalFee = fee * numberOfCards

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsUserWalletApiContext, totalGrossAmount, 'minimal')
  })

  test.afterAll(async () => {
    // await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - totalGrossAmount + netAmount, 'exact')
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - totalFee, 'exact')
  })

  test('fund a tipcard with payment method invoice', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/cards/${setId}`)

    // Configure the set
    await page.locator('[data-test="number-of-cards"]').fill(`${numberOfCards}`)
    await page.locator('[data-test="number-of-cards"]').blur()
    fullSetUrl = page.url()

    await page.locator('a[data-test="start-set-funding"]').click()

    // Fill in and submit the form
    await page.locator('[data-test="sats-amount-selector"] input').fill(`${netAmount}`)
    await page.locator('[data-test="textmessage-text-field"] input').fill('E2E Test Set Funding Tipcard Message')
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
    await getAndCheckWalletBalance(lnbitsUserWalletApiContext, walletBalanceBefore - totalGrossAmount, 'exact')
  })

  test('withdraw one tipcard back to the user wallet', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/${getRandomInt(0, numberOfCards - 1)}`)
    await withdrawCardViaLandingPage(cardHash, page, lnbitsUserWalletApiContext)
  })

  test('bulk withdraw the remaining tipcards back to the user wallet', async ({ page }) => {
    await page.goto(fullSetUrl)

    // Bulk withdraw is only possible for logged in users
    await loginViaUi({ page, lnbitsApiContext: lnbitsUserWalletApiContext })

    await page.locator('a[data-test="start-bulk-withdraw"]').click({ timeout: 10000 })

    // Get the LNURL withdraw link
    const lnurlW = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
    if (!lnurlW) {
      throw new Error('LNURL withdraw link not found or empty')
    }

    // Withdraw the tipcard to LNbits
    const { amount } = await withdrawLnurlW(lnbitsUserWalletApiContext, lnurlW)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })

    const expectedAmount = netAmount * (numberOfCards - 1)
    expect(amount).toBe(expectedAmount)
  })
})
