import { vi } from 'vitest'

import type { ProfileDto } from '../../../../shared/src/data/trpc/tipcards/ProfileDto'

export const tRpcMock = {
  profile: {
    get: {
      query: vi.fn(async (): Promise<ProfileDto> => ({
        accountName: '',
        displayName: '',
        email: '',
      })),
    },

    update: {
      mutate: vi.fn(async (profile: ProfileDto): Promise<ProfileDto> => profile),
    },

    getDisplayName: {
      query: vi.fn(async (): Promise<ProfileDto['displayName']> => ''),
    },
  },
}

vi.doMock('@/modules/useTRpc', () => ({
  default: () => tRpcMock,
  isTRrpcClientError: vi.fn(() => true),
  isTRpcClientAbortError: vi.fn(() => true),
}))
