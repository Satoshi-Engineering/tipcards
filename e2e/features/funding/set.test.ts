import { test, expect } from '@playwright/test'

import { payInvoice, withdrawLnurlW } from '@e2e/utils/lnbits/api/payments.js'
import { getAndCheckWalletBalance } from '@e2e/utils/lnbits/api/wallet.js'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'
import { generateRandomCardFundingInfo, withdrawCardViaLandingPage } from '@e2e/utils/card.js'
import { getRandomInt } from '@e2e/utils/getRandomInt'
import hashSha256 from '@frontend/modules/hashSha256'
import { loginViaUi } from '@e2e/utils/auth/login'

test.describe('Tipcard Set Funding', () => {
  test.describe.configure({ mode: 'serial' })

  let walletBalanceBefore: number
  const setId = crypto.randomUUID()
  let fullSetUrl = ''
  const numberOfCards = getRandomInt(2, 50)
  const { netAmount, grossAmount, fee } = generateRandomCardFundingInfo(210, 2100)
  const totalGrossAmount = grossAmount * numberOfCards
  const totalFee = fee * numberOfCards

  test.beforeAll(async () => {
    // Ensure the wallet has enough balance
    walletBalanceBefore = await getAndCheckWalletBalance(lnbitsTestUserWalletApiContext, totalGrossAmount, 'minimal')
  })

  test.afterAll(async () => {
    await getAndCheckWalletBalance(lnbitsTestUserWalletApiContext, walletBalanceBefore - totalFee, 'exact', true)
  })

  test('fund a set via set funding', async ({ page }) => {
    await page.goto(`${process.env.TIPCARDS_ORIGIN}/cards/${setId}`)

    // Configure the set
    await page.locator('[data-test="number-of-cards"]').fill(`${numberOfCards}`)
    await page.locator('[data-test="number-of-cards"]').blur()
    fullSetUrl = page.url()

    await page.locator('a[data-test="start-set-funding"]').click()

    // Fill in and submit the form
    await page.locator('[data-test="sats-amount-selector"] input').fill(`${netAmount}`)
    await page.locator('[data-test="textmessage-text-field"] input').fill('E2E Test Set Funding Tipcard Message')
    const invoiceResponse = page.waitForResponse(response => response.url().includes(`/api/set/invoice/${setId}`))
    await page.locator('[data-test="funding-submit-button"]').click()
    expect((await invoiceResponse).ok()).toBe(true)

    // Get the invoice
    await expect(page.locator('[data-test="lightning-qr-code-image"]')).toBeVisible()
    const invoice = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
    if (!invoice) {
      throw new Error('Invoice QR code not found or empty')
    }

    // Pay the invoice using LNbits
    await payInvoice(lnbitsTestUserWalletApiContext, invoice)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60000 })
    await getAndCheckWalletBalance(lnbitsTestUserWalletApiContext, walletBalanceBefore - totalGrossAmount, 'exact', true)
  })

  test('withdraw one tipcard back to the user wallet', async ({ page }) => {
    const cardHash = await hashSha256(`${setId}/${getRandomInt(0, numberOfCards - 1)}`)
    await withdrawCardViaLandingPage(cardHash, page, lnbitsTestUserWalletApiContext)
  })

  test('bulk withdraw the remaining tipcards back to the user wallet', async ({ page }) => {
    test.setTimeout(90_000)

    await page.goto(fullSetUrl)

    // Bulk withdraw is only possible for logged in users
    await loginViaUi({ page, lnbitsApiContext: lnbitsTestUserWalletApiContext })

    const bulkWithdrawResponse = page.waitForResponse(response => response.url().includes('bulkWithdraw.createForCards'))
    await page.locator('a[data-test="start-bulk-withdraw"]').click({ timeout: 10_000 })
    expect((await bulkWithdrawResponse).ok()).toBe(true)

    // Get the LNURL withdraw link
    await expect(page.locator('[data-test="lightning-qr-code-image"]')).toHaveAttribute('href')
    const lnurlW = await page.locator('[data-test="lightning-qr-code-image"]').getAttribute('href')
    if (!lnurlW) {
      throw new Error('LNURL withdraw link not found or empty')
    }

    // Withdraw the tipcard to LNbits
    const { amount } = await withdrawLnurlW(lnbitsTestUserWalletApiContext, lnurlW)
    await expect(page.locator('[data-test="lightning-qr-code-image-success"]')).toBeVisible({ timeout: 60_000 })

    const expectedAmount = netAmount * (numberOfCards - 1)
    expect(amount).toBe(expectedAmount)
  })
})
