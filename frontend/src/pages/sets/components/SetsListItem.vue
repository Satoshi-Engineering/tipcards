<template>
  <LinkDefault
    ref="item"
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
        {{ $d(set.created, dateWithTimeFormat) }}
      </time>
    </div>
    <div
      v-if="!noCardsInfo"
      class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end grid grid-cols-[repeat(6,8px)] grid-rows-[repeat(2,8px)] gap-[2px]"
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
  </LinkDefault>
</template>

<script setup lang="ts">
import { computed, type PropType, useTemplateRef, onMounted, onUnmounted, ref, watch } from 'vue'

import type { SetDto } from '@shared/data/trpc/SetDto'
import type { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto'

import useSets from '@/modules/useSets'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import { dateWithTimeFormat } from '@/utils/dateFormats'

const { encodeCardsSetSettings } = useSets()

const props = defineProps({
  set: {
    type: Object as PropType<SetDto>,
    required: true,
  },
  cardsInfo: {
    type: Object as PropType<SetCardsInfoDto>,
    default: undefined,
  },
  noCardsInfo: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['enterViewport'])

const displayedCardsInfoItems = computed(() => Math.min(12, props.set.settings.numberOfCards))

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
  const relativeNumber = value / props.set.settings.numberOfCards * displayedCardsInfoItems.value
  if (relativeNumber <= 0) {
    return 0
  }
  if (relativeNumber <= 1) {
    return 1
  }
  return Math.round(relativeNumber)
}

const isInViewport = ref(false)

const itemRef = useTemplateRef<InstanceType<typeof LinkDefault>>('item')

const isInViewportObserver = new IntersectionObserver(async (entries) => {
  if (entries[0].isIntersecting) {
    isInViewport.value = true
    return
  }
  isInViewport.value = false
})

onMounted(async () => {
  isInViewportObserver.observe(itemRef.value!.$el)
})

onUnmounted(() => {
  isInViewportObserver.disconnect()
})

const emitIfInViewportLongEnough = async () => {
  if (!isInViewport.value) {
    return
  }
  await new Promise((resolve) => setTimeout(resolve, 500))
  if (!isInViewport.value) {
    return
  }
  emit('enterViewport')
}

watch(isInViewport, emitIfInViewportLongEnough)
</script>
