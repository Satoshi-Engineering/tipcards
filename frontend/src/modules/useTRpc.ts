import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '@backend/trpc'

import { useAuthStore } from '@/stores/auth'
import { BACKEND_API_ORIGIN } from '@/constants'

const { getValidAccessToken } = useAuthStore()

const client = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${BACKEND_API_ORIGIN}/trpc`,
      headers: async () => {
        const accessToken = await getValidAccessToken()
        return {
          Authorization: accessToken || '',
        }
      },
    }),
  ],
})

export default () => ({ client })
