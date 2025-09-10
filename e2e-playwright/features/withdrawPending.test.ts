import { test, expect } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import { getCardVersion } from '@e2e-playwright/utils/database/cardVersion'
import { updateWithdrawLink } from '@e2e-playwright/utils/lnbits/database/withdraw'
import { getLnbitsApiContext } from '@e2e-playwright/utils/lnbits/lnbits'
import { fundCard, getCardStatus, withdrawCard } from '@e2e-playwright/utils/card'

const lnbitsUserWalletApiContext = await getLnbitsApiContext(process.env.LNBITS_ORIGIN, process.env.LNBITS_ADMIN_KEY)

test('check if card has withdrawPending state after withdrawing before the webhook call from lnbits comes in', async () => {
  const cardHash = await hashSha256(crypto.randomUUID())
  await fundCard(cardHash, lnbitsUserWalletApiContext)
  await replaceWebhookUrlWithGibberish(cardHash) // set the webhook url to gibberish in the so that the status of the card never gets set to withdrawn

  await new Promise((resolve) => setTimeout(resolve, 1000)) // wait time of a new withdraw link is 1 second
  await withdrawCard(cardHash, lnbitsUserWalletApiContext)

  expect(await getCardStatus(cardHash)).toBe('withdrawPending')
})

const replaceWebhookUrlWithGibberish = async (cardHash: string) => {
  const lnurlWId = (await getCardVersion(cardHash)).lnurlW
  await updateWithdrawLink(lnurlWId, { webhookUrl: 'gibberish' })
}
