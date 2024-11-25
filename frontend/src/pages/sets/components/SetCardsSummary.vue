<template>
  <div
    class="grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
    data-test="sets-list-item-cards-summary"
  >
    <template v-if="loadingStatus === 'loading' && cardsSummary == null">
      <div
        v-for="n in displayedCardsSummaryItems"
        :key="n"
        class="w-full h-full bg-white-50 border-[0.7px] border-black opacity-20"
      />
    </template>
    <template v-if="loadingStatus === 'error'">
      <div
        v-for="n in displayedCardsSummaryItems"
        :key="n"
        class="w-full h-full bg-red-light text-red text-[8px] text-center leading-none"
      >
        ?
      </div>
    </template>
    <template v-else>
      <div
        v-for="n in cardsSummaryItems.withdrawn"
        :key="n"
        data-test="sets-list-item-cards-summary-withdrawn"
        class="w-full h-full bg-green"
      />
      <div
        v-for="n in cardsSummaryItems.funded"
        :key="n"
        data-test="sets-list-item-cards-summary-funded"
        class="w-full h-full bg-yellow"
      />
      <div
        v-for="n in cardsSummaryItems.userActionRequired"
        :key="n"
        data-test="sets-list-item-cards-summary-userActionRequired"
        class="w-full h-full bg-white border-[0.7px] border-yellow"
      />
      <div
        v-for="n in cardsSummaryItems.unfunded"
        :key="n"
        data-test="sets-list-item-cards-summary-unfunded"
        class="w-full h-full bg-white border-[0.7px] border-black"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'

import type { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto'

const props = defineProps({
  loadingStatus: {
    type: String as PropType<'loading' | 'error' | 'success'>,
    required: true,
  },
  cardsSummary: {
    type: Object as PropType<CardsSummaryDto>,
    required: false,
    default: null,
  },
  numberOfCards: {
    type: Number,
    required: true,
  },
})

const displayedCardsSummaryItems = computed(() => Math.min(12, props.numberOfCards))

const cardsSummaryItems = computed(() => {
  const sortedCardsSummary: { kpi: keyof CardsSummaryDto, count: number }[] = [
    { kpi: 'withdrawn', count: props.cardsSummary?.withdrawn.count ?? 0 },
    { kpi: 'funded', count: props.cardsSummary?.funded.count ?? 0 },
    { kpi: 'userActionRequired', count: props.cardsSummary?.userActionRequired.count ?? 0 },
    { kpi: 'unfunded', count: props.cardsSummary?.unfunded.count ?? 0 },
  ]
  sortedCardsSummary.sort((a, b) => a.count - b.count)

  const cardsSummaryItems = {
    withdrawn: 0,
    funded: 0,
    userActionRequired: 0,
    unfunded: 0,
  }

  let remainingBoxes = displayedCardsSummaryItems.value

  sortedCardsSummary.forEach((cardsSummary) => {
    cardsSummaryItems[cardsSummary.kpi] = Math.min(getRelativeCardsSummary(cardsSummary.count), remainingBoxes)
    remainingBoxes -= cardsSummaryItems[cardsSummary.kpi]
  })

  return cardsSummaryItems
})

const getRelativeCardsSummary = (value: number = 0) => {
  const relativeNumber = value / props.numberOfCards * displayedCardsSummaryItems.value
  if (relativeNumber <= 0) {
    return 0
  }
  if (relativeNumber <= 1) {
    return 1
  }
  return Math.round(relativeNumber)
}
</script>
