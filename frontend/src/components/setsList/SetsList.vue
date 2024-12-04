<template>
  <ItemsListWithLoading
    :header-primary="$t('sets.setInfo')"
    :header-secondary="noCardsSummary == false ? $t('general.status') : undefined"
    :items="sortedSavedSets"
    :not-logged-in="notLoggedIn"
    :loading="fetching && sets.length < 1"
    :reloading="fetching && sets.length > 0"
    data-test="sets-list"
  >
    <template v-if="$slots.message" #message>
      <slot name="message" />
    </template>
    <template #notLoggedInMessage>
      <SetsListMessageNotLoggedIn />
    </template>
    <template #listEmptyMessage>
      <SetsListMessageEmpty />
    </template>
    <template #default="{ item: set }">
      <SetsListItem
        :set="set"
        :cards-summary-with-loading-status="cardsSummaryBySetId[set.id]"
        :no-cards-summary="noCardsSummary"
        class="-mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default"
        @enter-viewport="$emit('enterViewport', set.id)"
      />
    </template>
  </ItemsListWithLoading>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { SetDto } from '@shared/data/trpc/SetDto'

import SetsListItem from '@/components/setsList/components/SetsListItem.vue'
import type { CardsSummaryWithLoadingStatusBySetId } from '@/data/CardsSummaryWithLoadingStatus'
import ItemsListWithLoading from '@/components/itemsList/ItemsListWithMessages.vue'
import SetsListMessageNotLoggedIn from './components/SetsListMessageNotLoggedIn.vue'
import SetsListMessageEmpty from './components/SetsListMessageEmpty.vue'

const props = defineProps({
  notLoggedIn: {
    type: Boolean,
    default: false,
  },
  sets: {
    type: Array as PropType<SetDto[]>,
    default: () => [],
  },
  cardsSummaryBySetId: {
    type: Object as PropType<CardsSummaryWithLoadingStatusBySetId>,
    default: () => ({}),
  },
  noCardsSummary: {
    type: Boolean,
    default: false,
  },
  fetching: {
    type: Boolean,
    default: false,
  },
  sorting: {
    type: String as PropType<'changed' | 'name'>,
    default: 'changed',
  },
})

defineEmits(['enterViewport'])

const sortedSavedSets = computed(() => {
  return [...props.sets]
    .map((set) => ({
      ...set,
    }))
    .sort(props.sorting === 'changed' ? sortByChangedDate : sortByName)
})

const sortByChangedDate = (setA: SetDto, setB: SetDto) => {
  return +setB.changed - +setA.changed
}

const sortByName = (setA: SetDto, setB: SetDto) => {
  const nameA = setA.settings.name?.toLowerCase()
  const nameB = setB.settings.name?.toLowerCase()
  if (nameA == null || nameA === '') {
    return 1
  }
  if (nameB == null || nameB === '') {
    return -1
  }
  return nameA.localeCompare(nameB)
}
</script>
