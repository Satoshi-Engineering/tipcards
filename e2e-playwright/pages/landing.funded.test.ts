import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import LNURL from '@shared/modules/LNURL/LNURL'

import { fundCard } from '@e2e-playwright/utils/card'
import { lnbitsTestUserWalletApiContext } from '@e2e-playwright/utils/lnbits/api/apiContext'

test.use({ locale: 'en-US', viewport: { width: 1000, height: 660 } })

test.describe('Landing Page', () => {
  test('should show the default landing page for a funded card', async ({ page }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')

    await page.goto(`/landing/${cardHash}`)

    await expect(page.locator('[data-test="greeting-funded-headline"]')).toBeAttached()
    await expect(page.locator('[data-test="greeting-funded-bitcoin-amount"]')).toContainText('0.00000210 BTC')
  })

  test('should rewrite the url to cardHash from /landing?lightning=lnurl', async ({ page }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 210, 'Have fun with testing!')
    const lnurl = LNURL.encode(
      `${process.env.TIPCARDS_ORIGIN}/api/lnurl/${cardHash}`,
    ).toUpperCase()

    await page.goto(`/landing?lightning=${lnurl}`)

    await expect(page).toHaveURL(new RegExp(`/landing/${cardHash}`))
    await expect(page.locator('[data-test="greeting-funded-headline"]')).toBeAttached()
    await expect(page.locator('[data-test="greeting-funded-bitcoin-amount"]')).toContainText('0.00000210 BTC')
  })
})
