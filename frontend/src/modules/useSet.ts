import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

import type { SetDto } from '@shared/data/trpc/SetDto'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import { useSetsStore } from '@/stores/sets'

export const useSet = (setId: string) => {
  const setsStore = useSetsStore()
  const { sets, fetchingAllSets, fetchingAllSetsUserErrorMessages } = storeToRefs(setsStore)

  const i18n = useI18n({ useScope: 'global' })
  const set = computed<SetDto | undefined>(() => sets.value.find(s => s.id === setId))
  const loading = computed(() => set.value == null && fetchingAllSets.value)
  const reloading = computed(() => fetchingAllSets.value)
  const userErrorMessages = computed(() => fetchingAllSetsUserErrorMessages.value)
  const displayName = computed(() => set.value != null ? SetDisplayInfo.create(set.value, i18n).displayName : undefined)

  setsStore.loadSets()
  setsStore.subscribeToLoggedInChanges()

  return {
    reload: setsStore.loadSets,
    set,
    loading,
    reloading,
    userErrorMessages,
    displayName,
  }
}
