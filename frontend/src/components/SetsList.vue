<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="grid grid-cols-[1fr,4.5rem] border-b border-white-50 py-4 px-5">
      <HeadlineDefault level="h4" class="text-sm font-normal !my-0">
        {{ $t('sets.setInfo') }}
      </HeadlineDefault>
      <HeadlineDefault
        v-if="!noStatistics"
        level="h4"
        class="text-sm font-normal !my-0"
      >
        {{ $t('general.status') }}
      </HeadlineDefault>
    </header>
    <ul v-if="!fetching">
      <li
        v-for="set in sortedSavedSets"
        :key="set.id"
        class="mx-5 border-b last:border-0 border-white-50 group"
      >
        <SetsListItem
          :set="set"
          :statistics="statistics[set.id]"
          :no-statistics="noStatistics || statistics[set.id] === null"
          class="-mx-5 px-5 py-4 group-last:pb-6 group-last:rounded-b-default"
        />
      </li>
    </ul>
    <div v-else class="flex justify-center min-h-64">
      <IconAnimatedLoadingWheel
        class="w-10 h-auto mx-auto my-10 text-white-50"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { SetDto } from '@shared/data/trpc/tipcards/SetDto'

import type { SetStatisticsBySetId } from '@/modules/useSets'
import SetsListItem from './SetsListItem.vue'
import IconAnimatedLoadingWheel from './icons/IconAnimatedLoadingWheel.vue'
import HeadlineDefault from './typography/HeadlineDefault.vue'

const props = defineProps({
  sets: {
    type: Array as PropType<SetDto[]>,
    default: () => [],
  },
  statistics: {
    type: Object as PropType<SetStatisticsBySetId>,
    default: () => ({}),
  },
  noStatistics: {
    type: Boolean,
    default: false,
  },
  fetching: {
    type: Boolean,
    defaut: false,
  },
})

const sortedSavedSets = computed(() => {
  return [...props.sets]
    .map((set) => ({
      ...set,
      cardsStatus: null, // Implement this later
    }))
    .sort((setA, setB) => {
      const nameA = setA.settings.name?.toLowerCase()
      const nameB = setB.settings.name?.toLowerCase()
      if (nameA == null || nameA === '') {
        return 1
      }
      if (nameB == null || nameB === '') {
        return -1
      }
      return nameA.localeCompare(nameB)
    })
})
</script>
