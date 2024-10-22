import {
  createTRPCClient,
  splitLink,
  httpBatchLink,
  unstable_httpSubscriptionLink,
  TRPCClientError,
  type CreateTRPCClient,
} from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter as AuthRouter } from '@auth/trpc'

import { TIPCARDS_AUTH_ORIGIN } from '@/constants'

const createClient = () => createTRPCClient<AuthRouter>({
  links: [
    splitLink({
      condition: (operation) => operation.type === 'subscription',
      true: unstable_httpSubscriptionLink({
        url: `${TIPCARDS_AUTH_ORIGIN}/auth/trpc`,
        transformer: superjson,
      }),
      false: httpBatchLink({
        url: `${TIPCARDS_AUTH_ORIGIN}/auth/trpc`,
        transformer: superjson,
        maxURLLength: 2083,
        fetch: (url, options) => fetch(url, {
          ...options,
          credentials: 'include',
        }),
      }),
    }),
  ],
})

export default (): CreateTRPCClient<AuthRouter> => {
  return createClient()
}

export const asTRrpcClientError = (cause: unknown):
  TRPCClientError<AuthRouter> | undefined =>
  cause instanceof TRPCClientError ? cause : undefined
