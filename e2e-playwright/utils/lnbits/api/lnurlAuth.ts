import { APIRequestContext, request } from '@playwright/test'

import { removeLightningPrefix } from '@e2e-playwright/utils/removeLightningPrefix'
import HDWallet from '@shared/modules/HDWallet/HDWallet.js'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'

export const lnurlAuth = async (context: APIRequestContext, lnurl: string) => {
  void context

  const signingKey = HDWallet.generateRandomNode()
  const lnurlAuth = new LNURLAuth({
    publicKeyAsHex: signingKey.getPublicKeyAsHex(),
    privateKeyAsHex: signingKey.getPrivateKeyAsHex(),
  })
  const callbackUrl = lnurlAuth.getLNURLAuthCallbackUrl(removeLightningPrefix(lnurl))
  const authContext = await request.newContext()

  try {
    const response = await authContext.get(callbackUrl.toString())
    if (!response.ok()) {
      throw new Error(`Failed to perform lnurlauth: ${await response.text()}`)
    }
  } finally {
    await authContext.dispose()
  }
}
