import { vi } from 'vitest'

export const tRpcMock = {
  profile: {
    getDisplayName: {
      query: vi.fn(async () => ''),
    },
  },
}

vi.doMock('@/modules/useTRpc', () => ({
  default: () => tRpcMock,
}))
