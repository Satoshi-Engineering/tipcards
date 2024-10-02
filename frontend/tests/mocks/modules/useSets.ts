import { vi } from 'vitest'
import { ref } from 'vue'

export const useSetsMethods = {
  fetchingAllSets: ref(false),
  fetchingStatistics: ref(false),
  fetchingUserErrorMessages: ref(false),
  encodeCardsSetSettings: vi.fn(),
  getAllSets: vi.fn(async () => []),
  getStatisticsBySetId: vi.fn(),
}

vi.mock('@/modules/useSets', () => {
  return {
    default: () => (useSetsMethods),
  }
})
