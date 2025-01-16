import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import type { SetDto } from '@shared/data/trpc/SetDto'
import useTRpc from '@/modules/useTRpc'
import { useSetsStore } from '@/stores/sets'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import type { CardStatusDto } from '@shared/data/trpc/CardStatusDto'

export const useSet = (setId: string) => {
  const setsStore = useSetsStore()
  const { sets, fetchingAllSets, fetchingAllSetsUserErrorMessages } = storeToRefs(setsStore)

  const { set: setTrpcRouter } = useTRpc()

  const i18n = useI18n({ useScope: 'global' })
  const set = computed<SetDto | undefined>(() => sets.value.find(s => s.id === setId))
  const loading = computed(() => set.value == null && fetchingAllSets.value)
  const reloading = computed(() => fetchingAllSets.value)
  const userErrorMessages = computed(() => fetchingAllSetsUserErrorMessages.value)
  const displayName = computed(() => set.value != null ? SetDisplayInfo.create(set.value, i18n).displayName : undefined)
  const cardStatuses = ref<CardStatusDto[]>([])
  const loadCardStatuses = async (): Promise<void> => {
    if (set.value == null) {
      return
    }
    cardStatuses.value = await setTrpcRouter.getCardStatusesForSetId.query(set.value.id)
  }

  setsStore.loadSets()
  setsStore.subscribeToLoggedInChanges()
  watch(set, loadCardStatuses, { immediate: true })

  return {
    reload: setsStore.loadSets,
    set,
    loading,
    reloading,
    userErrorMessages,
    displayName,
    cardStatuses,
  }
}
