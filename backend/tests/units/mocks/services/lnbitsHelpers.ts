import { Mock, vi } from 'vitest'

export const isLnbitsWithdrawLinkUsed: Mock<() => Promise<boolean>> = vi.fn(async () => false)

vi.mock('@backend/services/lnbitsHelpers', () => ({
  isLnbitsWithdrawLinkUsed,
}))
