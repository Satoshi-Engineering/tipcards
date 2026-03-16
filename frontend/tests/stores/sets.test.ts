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
import { flushPromises } from '@vue/test-utils'

describe('useSetsStore', () => {
  const authStore = vi.mocked(useAuthStore())

  setActivePinia(createPinia())
  const setsStore = useSetsStore()
  const { sets, fetchingAllSets, cardsSummaryWithStatusBySetId } = storeToRefs(setsStore)

  const setsResponse = Array.from({ length: 3 }, () => createSet())
  const originalQuery = tRpcMock.set.getAll.query
  const querySets = vi.fn(async () => setsResponse)

  const originalQueryCardsSummary = tRpcMock.set.getCardsSummaryForSetId.query
  const queryCardsSummary = vi.fn(async (setId): Promise<CardsSummaryDto> => {
    if (setId === 'setThatThrowsError') {
      throw new Error('Test error')
    }
    return {
      withdrawn: { count: 0, amount: 0 },
      funded: { count: 0, amount: 0 },
      unfunded: { count: 0, amount: 0 },
      userActionRequired: { count: 0, amount: 0 },
    }
  })

  beforeAll(() => {
    tRpcMock.set.getAll.query = querySets
    tRpcMock.set.getCardsSummaryForSetId.query = queryCardsSummary
  })

  afterAll(() => {
    tRpcMock.set.getAll.query = originalQuery
    tRpcMock.set.getCardsSummaryForSetId.query = originalQueryCardsSummary
  })

  it('should load all sets if the user is logged in', async () => {
    authStore.isLoggedIn = true

    await setsStore.loadSets()

    expect(sets.value).toStrictEqual(setsResponse)
  })

  it('should not load sets if the user is not logged in', async () => {
    vi.clearAllMocks()
    authStore.isLoggedIn = false

    await setsStore.loadSets()

    expect(querySets).not.toHaveBeenCalled()
    expect(sets.value).toStrictEqual([])
  })

  it('should load all sets when subscribed and the user logs in', async () => {
    vi.clearAllMocks()

    authStore.isLoggedIn = false
    setsStore.subscribeToLoggedInChanges()
    await flushPromises()

    expect(querySets).not.toHaveBeenCalled()

    authStore.isLoggedIn = true
    await flushPromises()

    expect(querySets).toHaveBeenCalledOnce()
  })

  it('should not load all sets when the user logs in if not subscribed', async () => {
    vi.clearAllMocks()
    authStore.isLoggedIn = false

    setsStore.unsubscribeFromLoggedInChanges()
    await flushPromises()

    expect(querySets).not.toHaveBeenCalled()

    authStore.isLoggedIn = true
    await flushPromises()

    expect(querySets).not.toHaveBeenCalled()
  })

  it('should update "fetchingAllSets" correctly when loading the cards for a set', async () => {
    authStore.isLoggedIn = true

    const loadSetsPromise = setsStore.loadSets()

    expect(fetchingAllSets.value).toBe(true)

    await loadSetsPromise

    expect(fetchingAllSets.value).toBe(false)
  })

  it('should query the cards summary for a set', async () => {
    vi.clearAllMocks()
    const set = createSet()

    await setsStore.loadCardsSummaryForSet(set.id)

    expect(tRpcMock.set.getCardsSummaryForSetId.query).toHaveBeenCalledWith(set.id)
  })

  it('should update the cards summary status when loading the cards summary for a set', async () => {
    vi.clearAllMocks()
    const set = createSet()

    setsStore.loadCardsSummaryForSet(set.id)

    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('loading')

    await flushPromises()

    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('success')
    expect(queryCardsSummary).toHaveBeenCalledOnce()
  })

  it('should update the cards summary status when loading the cards summary for a set fails', async () => {
    vi.clearAllMocks()
    const setThatThrowsError = createSet({ id: 'setThatThrowsError' })
    const set = createSet()

    setsStore.loadCardsSummaryForSet(setThatThrowsError.id)
    setsStore.loadCardsSummaryForSet(set.id)

    expect(cardsSummaryWithStatusBySetId.value[setThatThrowsError.id].status).toBe('loading')
    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('loading')

    await flushPromises()

    expect(cardsSummaryWithStatusBySetId.value[setThatThrowsError.id].status).toBe('error')
    expect(cardsSummaryWithStatusBySetId.value[set.id].status).toBe('success')
  })

  it('should query the cards summary for a set and return it', async () => {
    vi.clearAllMocks()
    const set = createSet()

    const cardsSummary = await setsStore.fetchCardsSummaryForSet(set.id)

    expect(cardsSummary).toStrictEqual({
      cardsSummary: {
        withdrawn: { count: 0, amount: 0 },
        funded: { count: 0, amount: 0 },
        unfunded: { count: 0, amount: 0 },
        userActionRequired: { count: 0, amount: 0 },
      },
      status: 'success',
    })
  })

  it('should clone a set', async () => {
    vi.clearAllMocks()
    const set = createSet()
    const clonedSet = createSet({ id: 'cloned-set-id', settings: { ...set.settings, name: 'Cloned Set' } })
    const mutateClone = vi.fn(async () => clonedSet)
    tRpcMock.set.clone.mutate = mutateClone

    const result = await setsStore.cloneSet(set.id, 'Cloned Set')

    expect(mutateClone).toHaveBeenCalledWith({
      sourceSetId: set.id,
      newName: 'Cloned Set',
    })
    expect(querySets).toHaveBeenCalled() // fetchSets should be called after clone
    expect(result).toStrictEqual(clonedSet)
  })
})
