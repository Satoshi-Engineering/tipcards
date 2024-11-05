import {
  createTRPCClient,
  splitLink,
  httpBatchLink,
  unstable_httpSubscriptionLink,
  TRPCClientError,
  type CreateTRPCClient,
} from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '@backend/trpc'

import { BACKEND_API_ORIGIN } from '@/constants'

import useAuth from './useAuth'

export default (): CreateTRPCClient<AppRouter> => {
  if (client) {
    return client
  }

  return createClient()
}

export const isTRrpcClientError = (cause: unknown):
  cause is TRPCClientError<AppRouter> =>
  cause instanceof TRPCClientError

export const isTRpcClientAbortError = (cause: unknown) =>
  isTRrpcClientError(cause) && cause.message.includes('aborted')

let client: CreateTRPCClient<AppRouter>

const createClient = () => {
  const { getValidAccessToken } = useAuth()

  return client = createTRPCClient<AppRouter>({
    links: [
      splitLink({
        condition: (operation) => operation.type === 'subscription',
        true: unstable_httpSubscriptionLink({
          url: `${BACKEND_API_ORIGIN}/trpc`,
          transformer: superjson,
        }),
        false: httpBatchLink({
          url: `${BACKEND_API_ORIGIN}/trpc`,
          transformer: superjson,
          maxURLLength: 2083,
          headers: async () => {
            let accessToken: string | null
            try {
              accessToken = await getValidAccessToken()
            } catch {
              accessToken = null
            }
            return {
              Authorization: accessToken || '',
            }
          },
        }),
      }),
    ],
  })
}
