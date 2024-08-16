import { vi } from 'vitest'

export const tRpcMock = {
  profile: {
    get: {
      query: vi.fn(async () => ({
        accountName: '',
        displayName: '',
        email: '',
      })),
    },

    update: {
      mutation: vi.fn(async () => ({
        accountName: '',
        displayName: '',
        email: '',
      })),
    },

    getDisplayName: {
      query: vi.fn(async () => ''),
    },
  },
}

vi.doMock('@/modules/useTRpc', () => ({
  default: () => tRpcMock,
}))
