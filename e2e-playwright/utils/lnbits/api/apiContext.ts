import { request } from '@playwright/test'

export const getLnbitsApiContext = async (baseURL: string, apiKey?: string) => {
  if (!apiKey) {
    throw new Error('API key is required to create LNbits context')
  }
  return await request.newContext({
    baseURL: baseURL,
    extraHTTPHeaders: {
      'X-Api-Key': apiKey,
    },
  })
}
