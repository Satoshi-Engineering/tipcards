import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter as AuthRouter } from '@backend/auth/trpc'

import { TIPCARDS_AUTH_ORIGIN } from '@/constants'

const createClient = () => createTRPCProxyClient<AuthRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${TIPCARDS_AUTH_ORIGIN}/auth/trpc`,
      maxURLLength: 2083,
      headers: () => {
        return {}
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        })
      },
    }),
  ],
})

export default () => {
  return createClient()
}

export const asTRrpcClientError = (cause: unknown):
  TRPCClientError<AuthRouter> | undefined =>
  cause instanceof TRPCClientError ? cause : undefined
