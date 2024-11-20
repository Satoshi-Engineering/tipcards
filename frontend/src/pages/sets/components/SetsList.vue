<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="grid grid-cols-[1fr,4.5rem] border-b border-white-50 py-4 px-5">
      <HeadlineDefault level="h4" class="text-sm font-normal !my-0">
        {{ $t('sets.setInfo') }}
      </HeadlineDefault>
      <HeadlineDefault
        v-if="!noCardsSummary"
        level="h4"
        class="text-sm font-normal !my-0"
      >
        {{ $t('general.status') }}
      </HeadlineDefault>
    </header>
    <div v-if="message" class="px-5 py-4">
      <ParagraphDefault>
        {{ message }}
      </ParagraphDefault>
    </div>
    <ul>
      <li
        v-for="set in sortedSavedSets"
        :key="set.id"
        class="mx-5 border-b border-white-50 group"
        :class="{
          'last:border-0': !fetching
        }"
      >
        <SetsListItem
          :set="set"
          :cards-summary-with-loading-status="cardsSummaryBySetId[set.id]"
          :no-cards-summary="noCardsSummary"
          class="-mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default"
          @enter-viewport="$emit('enterViewport', set.id)"
        />
      </li>
    </ul>
    <div v-if="fetching" class="flex justify-center min-h-32">
      <IconAnimatedLoadingWheel
        class="w-10 h-auto mx-auto my-10 text-white-50"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { SetDto } from '@shared/data/trpc/SetDto'

import SetsListItem from '@/pages/sets/components/SetsListItem.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import type { CardsSummaryWithLoadingStatusBySetId } from '@/stores/sets'

const props = defineProps({
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
  message: {
    type: String,
    default: undefined,
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
      cardsStatus: null, // Implement this later
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
