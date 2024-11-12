import {
  TRPCClientError,
  type CreateTRPCClient,
} from '@trpc/client'

import type { AppRouter } from '@backend/trpc'

import useAuth from '@/modules/useAuth'
import { createBaseClient } from '@/modules/useTRpcBase'

export default (): CreateTRPCClient<AppRouter> => {
  if (!client) {
    client = createClient()
  }

  return client
}

export const isTRrpcClientError = (cause: unknown):
  cause is TRPCClientError<AppRouter> =>
  cause instanceof TRPCClientError

export const isTRpcClientAbortError = (cause: unknown) =>
  isTRrpcClientError(cause) && cause.message.includes('aborted')

let client: CreateTRPCClient<AppRouter>

const createClient = () => {
  const { getValidAccessTokenWithUnauthorizedHandling } = useAuth()
  const headers = async () => {
    const accessToken = await getValidAccessTokenWithUnauthorizedHandling()
    return {
      Authorization: accessToken || '',
    }
  }

  return createBaseClient({ headers })
}
