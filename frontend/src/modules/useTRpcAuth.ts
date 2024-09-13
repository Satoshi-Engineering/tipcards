import { createTRPCProxyClient, httpBatchLink, TRPCClientError } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter as AuthRouter } from '@backend/domain/auth/trpc'

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

export const isTRrpcClientError = (cause: unknown):
  cause is TRPCClientError<AuthRouter> =>
  cause instanceof TRPCClientError

export const isTRpcClientAbortError = (cause: unknown) =>
  isTRrpcClientError(cause) && cause.message.includes('aborted')
