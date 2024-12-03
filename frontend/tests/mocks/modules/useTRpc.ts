import { vi } from 'vitest'

import type { ProfileDto } from '@shared/data/trpc/ProfileDto'
import type { SetDto } from '@shared/data/trpc/SetDto'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto'

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

  set: {
    getAll: {
      query: vi.fn(async (): Promise<SetDto[]> => []),
    },
    getCardsSummaryForSetId: {
      query: vi.fn(async (): Promise<CardsSummaryDto> => CardsSummaryDto.parse({})),
    },
  },
}

vi.doMock('@/modules/useTRpc', () => ({
  default: () => tRpcMock,
  isTRrpcClientError: vi.fn(() => true),
  isTRpcClientAbortError: vi.fn(() => true),
}))
