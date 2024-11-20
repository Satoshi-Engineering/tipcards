import type { CardsSummaryWithLoadingStatusBySetId } from '@/stores/sets'
import type { SetDto } from '@shared/data/trpc/SetDto'
import { vi } from 'vitest'
import { computed, ref } from 'vue'

export const setsToReturn = ref<SetDto[]>([])

export const useSetsMock = {
  sets: computed<SetDto[]>(() => setsToReturn.value),
  cardsSummaryWithStatusBySetId: ref<CardsSummaryWithLoadingStatusBySetId>({}),
  fetchingAllSets: ref(false),
  fetchingStatistics: ref(false),
  fetchingUserErrorMessages: ref(false),
  loadCardsSummaryForSet: vi.fn(async () => new Promise<void>((resolve) => resolve())),
}

vi.doMock('@/stores/sets', () => ({
  default: () => useSetsMock,
}))
