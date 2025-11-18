import { APIRequestContext } from '@playwright/test'
import scanLnurl from './scanLnurl'

export const lnurlAuth = async (context: APIRequestContext, lnurl: string) => {
  const { callback } = await scanLnurl(context, lnurl)

  const response = await context.post('/api/v1/lnurlauth', {
    data: {
      callback,
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to perform lnurlauth: ${await response.text()}`)
  }
}
