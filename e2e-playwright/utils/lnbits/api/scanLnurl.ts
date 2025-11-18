import { APIRequestContext } from '@playwright/test'
import { removeLightningPrefix } from '@e2e-playwright/utils/removeLightningPrefix'

export default async (context: APIRequestContext, lnurl: string) => {
  const response = await context.get(`/api/v1/lnurlscan/${removeLightningPrefix(lnurl)}`)
  if (!response.ok()) {
    throw new Error(`Failed to scan LNURL: ${await response.text()}`)
  }
  return await response.json()
}
