import { request } from '@playwright/test'

export const getLnbitsApiContext = async (baseURL?: string, apiKey?: string) => {
  if (!baseURL) {
    throw new Error('LNbits origin is required to create LNbits context')
  }
  if (!apiKey) {
    throw new Error('API key is required to create LNbits context')
  }
  return await request.newContext({
    baseURL,
    extraHTTPHeaders: {
      'X-Api-Key': apiKey,
    },
  })
}

export const lnbitsE2eUserWalletApiContext = await getLnbitsApiContext(process.env.LNBITS_ORIGIN, process.env.LNBITS_ADMIN_KEY_E2E_USER_WALLET)
export const lnbitsApplicationWalletApiContext = await getLnbitsApiContext(process.env.LNBITS_ORIGIN, process.env.LNBITS_ADMIN_KEY)
