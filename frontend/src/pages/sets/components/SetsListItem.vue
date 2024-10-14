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
    <HeadlineDefault level="h4" class="col-start-1 col-span-2">
      <template v-if="typeof set.settings.name === 'string' && set.settings.name !== ''">
        {{ set.settings.name }}
      </template>
      <template v-else>{{ $t('sets.unnamedSetNameFallback') }}</template>
    </HeadlineDefault>
    <div class="col-start-1 text-sm">
      <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
      <span class="align-middle">
        {{ $t('general.cards', { count: set.settings.numberOfCards }) }}
      </span>
    </div>
    <div class="col-start-1">
      <time class="text-sm">
        {{ $d(set.created, {
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric'
        }) }}
      </time>
    </div>
    <div
      v-if="!noStatistics"
      class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
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
          class="w-full h-full bg-green"
        />
        <div
          v-for="n in statisticsItems.funded"
          :key="n"
          class="w-full h-full bg-yellow"
        />
        <div
          v-for="n in statisticsItems.pending"
          :key="n"
          class="w-full h-full bg-red"
        />
        <div
          v-for="n in statisticsItems.unfunded"
          :key="n"
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
  const withdrawn = Math.ceil(getRelativeStatistics(props.statistics?.withdrawn ?? 0))
  const funded = Math.ceil(getRelativeStatistics(props.statistics?.funded ?? 0))
  const pending = Math.ceil(getRelativeStatistics(props.statistics?.pending ?? 0))
  const unfunded = displayedStatisticsItems.value - withdrawn - funded - pending
  return {
    withdrawn,
    funded,
    pending,
    unfunded,
  }
})

const getRelativeStatistics = (value: number) => {
  return value / props.set.settings.numberOfCards * displayedStatisticsItems.value
}
</script>
