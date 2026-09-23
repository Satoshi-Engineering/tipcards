import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import LNURL from '@shared/modules/LNURL/LNURL'

import { fundCard, withdrawCard } from '@e2e-playwright/utils/card'
import { setCardWithdrawnDateIntoPast } from '@e2e-playwright/utils/database/cardVersion'
import { lnbitsTestUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'
import { withdrawLnurlW } from '@e2e-playwright/utils/lnbits/api/payments'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Landing Page', () => {
  test('should load the status of a recently withdrawn card', async ({ page }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')
    await withdrawCard(cardHash, lnbitsTestUserWalletApiContext)

    await page.goto(`/landing/${cardHash}`)

    await expect(page.locator('[data-test="greeting-recently-withdrawn"]')).toBeAttached()
  })

  test('should load the status of a withdrawn card', async ({ page }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')
    await withdrawCard(cardHash, lnbitsTestUserWalletApiContext)
    await setCardWithdrawnDateIntoPast(cardHash)

    await page.goto(`/landing/${cardHash}`)

    await expect(page.locator('[data-test="greeting-withdrawn"]')).toBeAttached()
  })

  test('should use (withdraw from) a funded card', async ({ page, request }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')
    const lnurl = LNURL.encode(
      `${process.env.TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`,
    ).toUpperCase()

    await page.goto(`/landing?lightning=${lnurl}`)
    const walletButton = page.locator('[data-test="lightning-qr-code-button-open-in-wallet"]')
    await expect(walletButton).toHaveAttribute('href')
    const href = await walletButton.getAttribute('href')
    const lnurlEncoded = href?.split('lightning:')[1]
    if (!lnurlEncoded) {
      throw new Error('Wallet link does not contain an encoded LNURL.')
    }

    await withdrawLnurlW(lnbitsTestUserWalletApiContext, lnurlEncoded)
    await request.post(
      `${process.env.BACKEND_API_ORIGIN}/api/withdraw/used/${cardHash}`,
    )

    await expect(page.locator('[data-test="greeting-recently-withdrawn"]')).toBeAttached()
  })
})
