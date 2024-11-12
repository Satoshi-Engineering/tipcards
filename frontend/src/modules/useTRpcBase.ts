import {
  createTRPCClient,
  splitLink,
  httpBatchLink,
  unstable_httpSubscriptionLink,
  type CreateTRPCClient,
  type HTTPHeaders,
  type Operation,
} from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '@backend/trpc'

import { BACKEND_API_ORIGIN } from '@/constants'

export default (): CreateTRPCClient<AppRouter> => {
  if (!client) {
    client = createBaseClient()
  }
  return client
}

let client: CreateTRPCClient<AppRouter>

export const createBaseClient = ({
  headers,
}: {
  headers?: HTTPHeaders | ((opts: { opList: Operation[] }) => HTTPHeaders | Promise<HTTPHeaders>),
} = {}): CreateTRPCClient<AppRouter> => {
  return createTRPCClient<AppRouter>({
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
          headers,
        }),
      }),
    ],
  })
}
