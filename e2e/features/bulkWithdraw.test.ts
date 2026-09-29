import { test, expect } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import { fundCard } from '@e2e/utils/card'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'

test('do not allow a bulk withdraw for duplicate hashes', { tag: '@parallel-safe' }, async ({ request }) => {
  const cardHash = await hashSha256(crypto.randomUUID())
  await fundCard(cardHash, lnbitsTestUserWalletApiContext)

  const response = await request.post(
    `${process.env.BACKEND_API_ORIGIN}/trpc/bulkWithdraw.createForCards`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        json: [cardHash, cardHash],
      },
    },
  )

  expect(response.status()).toBe(400)
})
