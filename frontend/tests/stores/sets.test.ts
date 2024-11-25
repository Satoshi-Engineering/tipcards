import { createPinia, setActivePinia, storeToRefs } from 'pinia'
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'

import { tRpcMock } from '../mocks/modules/useTRpc'
import '../mocks/i18n'
import '../mocks/provide'
import '../mocks/pinia'
import '../mocks/router'

import { useAuthStore } from '@/stores/auth'
import { useSetsStore } from '@/stores/sets'
import { createSet } from '../data/set'
import type { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto'

describe('useSetsStore', () => {
  const authStore = vi.mocked(useAuthStore())

  setActivePinia(createPinia())
  const setsStore = useSetsStore()
  const { sets, fetchingAllSets, cardsSummaryWithStatusBySetId } = storeToRefs(setsStore)
  const { loadSets, loadCardsSummaryForSet } = setsStore

  const setsResponse = Array.from({ length: 3 }, () => createSet())
  const originalQuery = tRpcMock.set.getAll.query
  const querySets = vi.fn(async () => setsResponse)

  const originalQueryCardsSummary = tRpcMock.set.getCardsSummaryBySetId.query
  const queryCardsSummary = vi.fn(async (): Promise<CardsSummaryDto> => ({
    withdrawn: { count: 0, amount: 0 },
    funded: { count: 0, amount: 0 },
    unfunded: { count: 0, amount: 0 },
    userActionRequired: { count: 0, amount: 0 },
  }))

  beforeAll(() => {
    tRpcMock.set.getAll.query = querySets
    tRpcMock.set.getCardsSummaryBySetId.query = queryCardsSummary
  })

  afterAll(() => {
    tRpcMock.set.getAll.query = originalQuery
    tRpcMock.set.getCardsSummaryBySetId.query = originalQueryCardsSummary
  })

  it('should load all sets', async () => {
    authStore.isLoggedIn = true
    await loadSets()
    await vi.waitFor(() => {
      if (fetchingAllSets.value === true) {
        throw Error('Waiting for the "fetch" to complete')
      }
    })
    expect(sets.value).toStrictEqual(setsResponse)
  })

  it('should not load sets if the user is not logged in', async () => {
    vi.clearAllMocks()
    authStore.isLoggedIn = false
    await loadSets()
    expect(sets.value).toStrictEqual([])
    expect(fetchingAllSets.value).toBe(false)
    expect(querySets).not.toHaveBeenCalled()
  })

  it('should query the cards summary for a set', async () => {
    vi.clearAllMocks()
    const set = createSet()
    await setsStore.loadCardsSummaryForSet(set.id)
    expect(tRpcMock.set.getCardsSummaryBySetId.query).toHaveBeenCalledWith(set.id)
  })

  it('should update the cards summary status when loading the cards summary for a set', async () => {
    vi.clearAllMocks()
    const set = createSet()
    loadCardsSummaryForSet(set.id)
    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('loading')
    await vi.waitFor(() => {
      if (cardsSummaryWithStatusBySetId.value[set.id].status === 'loading') {
        throw Error('Waiting for the "fetch" to complete')
      }
    })
    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('success')
    expect(queryCardsSummary).toHaveBeenCalledOnce()
  })
})
