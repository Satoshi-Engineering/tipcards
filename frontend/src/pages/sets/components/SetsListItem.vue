<template>
  <LinkDefault
    ref="item"
    class="grid grid-cols-[1fr,4.5rem] hover:bg-grey-light"
    data-test="sets-list-item"
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
      data-test="sets-list-item-name"
      class="col-start-1 col-span-2"
      :class="{ 'italic': !set.settings.name }"
    >
      <template v-if="typeof set.settings.name === 'string' && set.settings.name !== ''">
        {{ setDisplayInfo.displayName }}
      </template>
      <span v-else class="italic">{{ $t('sets.unnamedSetNameFallback') }}</span>
    </HeadlineDefault>
    <div class="col-start-1 text-sm">
      <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
      <span class="align-middle" data-test="sets-list-item-number-of-cards">
        {{ setDisplayInfo.displayNumberOfCards }}
      </span>
    </div>
    <div class="col-start-1">
      <time class="text-sm" data-test="sets-list-item-date">
        {{ setDisplayInfo.displayDate }}
      </time>
    </div>
    <SetCardsSummary
      v-if="!noCardsSummary"
      class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end"
      data-test="sets-list-item-cards-summary"
      :loading-status="cardsSummaryWithLoadingStatus?.status ?? 'loading'"
      :cards-summary="cardsSummaryWithLoadingStatus?.cardsSummary"
      :number-of-cards="set.settings.numberOfCards"
    />
  </LinkDefault>
</template>

<script setup lang="ts">
import { type PropType, useTemplateRef, onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SetDto } from '@shared/data/trpc/SetDto'
import type { CardsSummaryWithLoadingStatus } from '@/stores/sets'
import encodeCardsSetSettings from '@/utils/encodeCardsSetSettings'
import SetCardsSummary from '@/pages/sets/components/SetCardsSummary.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'

const props = defineProps({
  set: {
    type: Object as PropType<SetDto>,
    required: true,
  },
  cardsSummaryWithLoadingStatus: {
    type: Object as PropType<CardsSummaryWithLoadingStatus>,
    default: null,
  },
  noCardsSummary: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['enterViewport'])

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

const i18n = useI18n()
const setDisplayInfo = computed(() => { return SetDisplayInfo.create(props.set, i18n) })
</script>
