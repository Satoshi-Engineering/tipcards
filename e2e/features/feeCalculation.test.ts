import { expect, test } from '@playwright/test'

import hashSha256 from '@frontend/modules/hashSha256'
import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'

import { fundCard } from '@e2e/utils/card'
import { lnbitsTestUserWalletApiContext } from '@e2e/utils/lnbits/api/apiContext'

const invoice = 'lnbc4u1pne5fx3pp5w2ma9q08eh5t0amgjrnwmyceegn4za7tjnsursq8jmz8alq6rxhqdqqcqzzsxqyz5vqsp5ea4ng42k9kwz6dy8usd7xs37g0g5xlcy69ge7rvdnyquvqhv79zs9p4gqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpqysgqa6ej8npz6lxw2em8zlwvwdfh7sdvvvqdgpncvg5lfdwt5r8ked75xsnkutvt43uwwz34psxn4k2l6n6yyt6wu55huz82lknqt65uvccqk8j3w3'

test.describe('Fee Calculation', { tag: '@parallel-safe' }, () => {
  test('Should fail to pay out, if the estimated fee is too high', async ({ request }) => {
    const cardHash = await hashSha256(crypto.randomUUID())
    await fundCard(cardHash, lnbitsTestUserWalletApiContext, 400, 'Have fun with testing!')
    const lnurlResponse = await request.get(
      `${process.env.BACKEND_API_ORIGIN}/api/lnurl/${cardHash}`,
    )
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(await lnurlResponse.json())

    const response = await request.get(
      `${lnurlWithdrawRequest.callback}&k1=${lnurlWithdrawRequest.k1}&pr=${invoice}`,
    )
    const body = await response.json()

    expect(response.status()).toBe(200)
    expect(body.status).toBe('ERROR')
    expect(body.code).toBe('UnableToFindValidRoute')
  })
})
