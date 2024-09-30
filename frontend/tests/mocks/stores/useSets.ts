import { vi } from 'vitest'
import { computed, ref } from 'vue'

import type { SetDto } from '@shared/data/trpc/tipcards/SetDto'

export const sets = ref<SetDto[]>([])

vi.mock('@/stores/useSets', () => {
  return {
    default: () => ({
      sets: computed(() => sets.value),
      fetching: ref(false),
      fetchingUserErrorMessages: ref(false),
      encodeCardsSetSettings: vi.fn(),
      getAllSets: vi.fn(),
    }),
  }
})
