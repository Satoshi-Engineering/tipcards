import { ref, watch, type WatchHandle } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { CardStatusForHistoryDto } from '@shared/data/trpc/CardStatusForHistoryDto'

import i18n from '@/modules/initI18n'
import useTRpc, { isTRpcClientAbortError } from '@/modules/useTRpc'
import { useAuthStore } from '@/stores/auth'

export const useHistoryStore = defineStore('history', () => {
  const history = ref<CardStatusForHistoryDto[]>([])
  const historyTotal = ref<number | undefined>(undefined)
  const fetchingHistory = ref(false)
  const fetchingHistoryUserErrorMessages = ref<string[]>([])

  const loadHistory = async (limit: number = 10) => {
    if (isLoggedIn.value !== true) {
      clearHistory()
      return
    }
    const { data, pagination } = await fetchHistory({ limit: limit, offset: 0 })
    history.value = data
    historyTotal.value = pagination?.total
  }

  const loadHistoryNextPage = async (limit: number = 10) => {
    const { data, pagination } = await fetchHistory({ limit: limit, offset: history.value.length })
    history.value = [
      ...history.value,
      ...data,
    ]
    historyTotal.value = pagination?.total
  }

  const subscribeToLoggedInChanges = (limit: number = 10) => {
    unwatch = watch(isLoggedIn, () => loadHistory(limit))
  }

  const unsubscribeFromLoggedInChanges = () => {
    unwatch()
  }

  // I tried to use `useI18n` instead, but then the unit tests failed to initialize the i18n module
  const { t } = i18n.global
  const { card } = useTRpc()
  const { isLoggedIn } = storeToRefs(useAuthStore())
  let unwatch: WatchHandle

  const clearHistory = () => {
    history.value = []
  }

  const fetchHistory = async (options: { offset: number, limit: number } | undefined = undefined) => {
    fetchingHistoryUserErrorMessages.value.length = 0
    fetchingHistory.value = true
    try {
      return await card.cardHistory.query(options)
    } catch(error) {
      if (!isTRpcClientAbortError(error)) {
        console.error(error)
        fetchingHistoryUserErrorMessages.value.push(t('stores.history.errors.unableToLoadHistoryFromBackend'))
        if (error instanceof Error) {
          fetchingHistoryUserErrorMessages.value.push(error.message)
        }
      }
      throw error
    } finally {
      fetchingHistory.value = false
    }
  }

  return {
    history,
    historyTotal,
    fetchingHistory,
    fetchingHistoryUserErrorMessages,
    loadHistory,
    loadHistoryNextPage,
    subscribeToLoggedInChanges,
    unsubscribeFromLoggedInChanges,
  }
})
