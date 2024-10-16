<template>
  <LinkDefault
    class="grid grid-cols-[1fr,4.5rem] hover:bg-grey-light"
    no-underline
    no-bold
    :to="{
      name: 'cards',
      params: {
        setId: set.id,
        settings: encodeCardsSetSettings(set.settings),
        lang: $route.params.lang,
      }
    }"
  >
    <HeadlineDefault
      level="h4"
      class="col-start-1 col-span-2"
      data-test="sets-list-item-name"
    >
      <template v-if="typeof set.settings.name === 'string' && set.settings.name !== ''">
        {{ set.settings.name }}
      </template>
      <span v-else class="italic">{{ $t('sets.unnamedSetNameFallback') }}</span>
    </HeadlineDefault>
    <div class="col-start-1 text-sm">
      <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
      <span class="align-middle">
        {{ $t('general.cards', { count: set.settings.numberOfCards }) }}
      </span>
    </div>
    <div class="col-start-1">
      <time class="text-sm" data-test="sets-list-item-date">
        {{ $d(set.created, {
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric'
        }) }}
      </time>
    </div>
    <div
      v-if="!noStatistics"
      class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
      data-test="sets-list-item-statistics"
    >
      <template v-if="statistics == null">
        <div
          v-for="n in displayedStatisticsItems"
          :key="n"
          class="w-full h-full bg-white-50 border-[0.7px] border-black opacity-20"
        />
      </template>
      <template v-else>
        <div
          v-for="n in statisticsItems.withdrawn"
          :key="n"
          data-test="sets-list-item-statistics-withdrawn"
          class="w-full h-full bg-green"
        />
        <div
          v-for="n in statisticsItems.funded"
          :key="n"
          data-test="sets-list-item-statistics-funded"
          class="w-full h-full bg-yellow"
        />
        <div
          v-for="n in statisticsItems.pending"
          :key="n"
          data-test="sets-list-item-statistics-pending"
          class="w-full h-full bg-red-light"
        />
        <div
          v-for="n in statisticsItems.unfunded"
          :key="n"
          data-test="sets-list-item-statistics-unfunded"
          class="w-full h-full bg-white border-[0.7px] border-black"
        />
      </template>
    </div>
  </LinkDefault>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import type { SetDto } from '@shared/data/trpc/tipcards/SetDto'
import type { SetStatisticsDto } from '@shared/data/trpc/tipcards/SetStatisticsDto'

import useSets from '@/modules/useSets'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'

const { encodeCardsSetSettings } = useSets()

const props = defineProps({
  set: {
    type: Object as PropType<SetDto>,
    required: true,
  },
  statistics: {
    type: Object as PropType<SetStatisticsDto>,
    default: undefined,
  },
  noStatistics: {
    type: Boolean,
    default: false,
  },
})

const displayedStatisticsItems = computed(() => Math.min(12, props.set.settings.numberOfCards))

const statisticsItems = computed(() => {
  const sortedStatistics: { kpi: keyof SetStatisticsDto, count: number }[] = [
    { kpi: 'withdrawn', count: props.statistics?.withdrawn ?? 0 },
    { kpi: 'funded', count: props.statistics?.funded ?? 0 },
    { kpi: 'pending', count: props.statistics?.pending ?? 0 },
    { kpi: 'unfunded', count: props.statistics?.unfunded ?? 0 },
  ]
  sortedStatistics.sort((a, b) => a.count - b.count)

  const statisticsItems = {
    withdrawn: 0,
    funded: 0,
    pending: 0,
    unfunded: 0,
  }

  let remainingBoxes = displayedStatisticsItems.value

  sortedStatistics.forEach((statistic) => {
    statisticsItems[statistic.kpi] = Math.min(getRelativeStatistics(statistic.count), remainingBoxes)
    remainingBoxes -= statisticsItems[statistic.kpi]
  })

  return statisticsItems
})

const getRelativeStatistics = (value: number = 0) => {
  const relativeNumber = value / props.set.settings.numberOfCards * displayedStatisticsItems.value
  if (relativeNumber <= 0) {
    return 0
  }
  if (relativeNumber <= 1) {
    return 1
  }
  return Math.round(relativeNumber)
}
</script>
