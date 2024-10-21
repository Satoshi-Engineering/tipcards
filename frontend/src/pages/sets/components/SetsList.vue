<template>
  <section class="flow-root shadow-default rounded-default">
    <header class="grid grid-cols-[1fr,4.5rem] border-b border-white-50 py-4 px-5">
      <HeadlineDefault level="h4" class="text-sm font-normal !my-0">
        {{ $t('sets.setInfo') }}
      </HeadlineDefault>
      <HeadlineDefault
        v-if="!noCardsInfo"
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
    <ul v-if="!fetching">
      <li
        v-for="set in sortedSavedSets"
        :key="set.id"
        class="mx-5 border-b last:border-0 border-white-50 group"
      >
        <SetsListItem
          :data-set-id="set.id"
          :set="set"
          :cards-info="cardsInfoBySetId[set.id] ?? undefined"
          :no-cards-info="noCardsInfo || cardsInfoBySetId[set.id] === null"
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

import type { SetCardsInfoBySetId } from '@/modules/useSets'
import SetsListItem from '@/pages/sets/components/SetsListItem.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

const props = defineProps({
  sets: {
    type: Array as PropType<SetDto[]>,
    default: () => [],
  },
  cardsInfoBySetId: {
    type: Object as PropType<SetCardsInfoBySetId>,
    default: () => ({}),
  },
  noCardsInfo: {
    type: Boolean,
    default: false,
  },
  fetching: {
    type: Boolean,
    defaut: false,
  },
  message: {
    type: String,
    default: undefined,
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
