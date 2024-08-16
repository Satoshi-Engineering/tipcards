import { vi } from 'vitest'

import type { Profile } from '@shared/data/trpc/Profile'

export const tRpcMock = {
  profile: {
    get: {
      query: vi.fn(async (): Promise<Profile> => ({
        accountName: '',
        displayName: '',
        email: '',
      })),
    },

    update: {
      mutate: vi.fn(async (profile: Profile): Promise<Profile> => profile),
    },

    getDisplayName: {
      query: vi.fn(async (): Promise<Profile['displayName']> => ''),
    },
  },
}

vi.doMock('@/modules/useTRpc', () => ({
  default: () => tRpcMock,
  isTRrpcClientError: vi.fn(() => true),
  isTRpcClientAbortError: vi.fn(() => true),
}))
