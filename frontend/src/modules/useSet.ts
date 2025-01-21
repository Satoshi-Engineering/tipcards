import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import type { SetDto } from '@shared/data/trpc/SetDto'
import useTRpc from '@/modules/useTRpc'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

export const useSet = (setId: string) => {
  const { set: setTrpcRouter } = useTRpc()
  const { isLoggedIn } = storeToRefs(useAuthStore())

  const i18n = useI18n({ useScope: 'global' })
  const set = ref<SetDto | undefined>()
  const fetchingSet = ref(false)
  const loading = computed(() => set.value == null && fetchingSet.value)
  const reloading = computed(() => fetchingSet.value)
  const displayName = computed(() => set.value != null ? SetDisplayInfo.create(set.value, i18n).displayName : undefined)
  const cardStatuses = ref<CardStatusDto[]>([])
  const userErrorMessages = ref<string[]>([])

  const fetchSet = async (): Promise<void> => {
    userErrorMessages.value = []
    fetchingSet.value = true
    try {
      set.value = await setTrpcRouter.getById.query(setId)
    } catch (error) {
      console.error(error)
      userErrorMessages.value.push(i18n.t('set.errors.unableToLoadSetFromBackend'))
    } finally {
      fetchingSet.value = false
    }
  }

  const loadCardStatuses = async (): Promise<void> => {
    if (set.value == null) {
      return
    }
    cardStatuses.value = await setTrpcRouter.getCardStatusesForSetId.query(set.value.id)
  }

  watch(isLoggedIn, fetchSet, { immediate: true })
  watch(set, loadCardStatuses, { immediate: true })

  return {
    reload: fetchSet,
    set,
    loading,
    reloading,
    userErrorMessages,
    displayName,
    cardStatuses,
  }
}
