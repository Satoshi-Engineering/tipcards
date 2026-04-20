import { APIRequestContext } from '@playwright/test'
import scanLnurl from './scanLnurl'

export const lnurlAuth = async (context: APIRequestContext, lnurl: string) => {
  const { callback } = await scanLnurl(context, lnurl)
  const k1 = new URL(callback).searchParams.get('k1')
  if (!k1) {
    throw new Error('Failed to perform lnurlauth: missing k1 in LNURL auth callback')
  }

  const response = await context.post('/api/v1/lnurlauth', {
    data: {
      tag: 'login',
      callback,
      k1,
    },
  })
  if (!response.ok()) {
    throw new Error(`Failed to perform lnurlauth: ${await response.text()}`)
  }
}
