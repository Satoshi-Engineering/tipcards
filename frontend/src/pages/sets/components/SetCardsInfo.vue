<template>
  <div
    class="grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
    data-test="sets-list-item-cards-info"
  >
    <template v-if="cardsInfo == null">
      <div
        v-for="n in displayedCardsInfoItems"
        :key="n"
        class="w-full h-full bg-white-50 border-[0.7px] border-black opacity-20"
      />
    </template>
    <template v-else>
      <div
        v-for="n in cardsInfoItems.withdrawn"
        :key="n"
        data-test="sets-list-item-cards-info-withdrawn"
        class="w-full h-full bg-green"
      />
      <div
        v-for="n in cardsInfoItems.funded"
        :key="n"
        data-test="sets-list-item-cards-info-funded"
        class="w-full h-full bg-yellow"
      />
      <div
        v-for="n in cardsInfoItems.pending"
        :key="n"
        data-test="sets-list-item-cards-info-pending"
        class="w-full h-full bg-red-light"
      />
      <div
        v-for="n in cardsInfoItems.unfunded"
        :key="n"
        data-test="sets-list-item-cards-info-unfunded"
        class="w-full h-full bg-white border-[0.7px] border-black"
      />
    </template>
  </div>
</template>>

<script lang="ts" setup>
import { computed, type PropType } from 'vue'

import type { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto'

const props = defineProps({
  cardsInfo: {
    type: Object as PropType<SetCardsInfoDto>,
    required: false,
    default: null,
  },
  numberOfCards: {
    type: Number,
    required: true,
  },
})

const displayedCardsInfoItems = computed(() => Math.min(12, props.numberOfCards))

const cardsInfoItems = computed(() => {
  const sortedCardsInfo: { kpi: keyof SetCardsInfoDto, count: number }[] = [
    { kpi: 'withdrawn', count: props.cardsInfo?.withdrawn ?? 0 },
    { kpi: 'funded', count: props.cardsInfo?.funded ?? 0 },
    { kpi: 'pending', count: props.cardsInfo?.pending ?? 0 },
    { kpi: 'unfunded', count: props.cardsInfo?.unfunded ?? 0 },
  ]
  sortedCardsInfo.sort((a, b) => a.count - b.count)

  const cardsInfoItems = {
    withdrawn: 0,
    funded: 0,
    pending: 0,
    unfunded: 0,
  }

  let remainingBoxes = displayedCardsInfoItems.value

  sortedCardsInfo.forEach((cardsInfo) => {
    cardsInfoItems[cardsInfo.kpi] = Math.min(getRelativeCardsInfo(cardsInfo.count), remainingBoxes)
    remainingBoxes -= cardsInfoItems[cardsInfo.kpi]
  })

  return cardsInfoItems
})

const getRelativeCardsInfo = (value: number = 0) => {
  const relativeNumber = value / props.numberOfCards * displayedCardsInfoItems.value
  if (relativeNumber <= 0) {
    return 0
  }
  if (relativeNumber <= 1) {
    return 1
  }
  return Math.round(relativeNumber)
}
</script>
