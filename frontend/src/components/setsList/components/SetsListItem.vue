<template>
  <ItemsListItem
    ref="item"
    data-test="sets-list-item"
    :to="{
      name: 'cards',
      params: {
        setId: set.id,
        settings: encodeCardsSetSettingsFromDto(set.settings),
        lang: $route.params.lang,
      }
    }"
  >
    <template #headline>
      <span v-if="typeof set.settings.name === 'string' && set.settings.name !== ''" data-test="sets-list-item-name">
        {{ setDisplayInfo.displayName }}
      </span>
      <span
        v-else
        class="italic"
        data-test="sets-list-item-name"
      >
        {{ $t('sets.unnamedSetNameFallback') }}
      </span>
    </template>
    <template #default>
      <div>
        <IconTipCardSet class="inline-block align-middle me-2 w-auto h-5 text-yellow" />
        <span class="align-middle" data-test="sets-list-item-number-of-cards">
          {{ setDisplayInfo.displayNumberOfCards }}
        </span>
      </div>
      <div class="mt-1">
        <time class="text-sm" data-test="sets-list-item-date">
          {{ setDisplayInfo.displayDate }}
        </time>
      </div>
    </template>
    <template #bottomEnd>
      <SetsListItemCardsSummary
        v-if="!noCardsSummary"
        data-test="sets-list-item-cards-summary"
        :loading-status="cardsSummaryLoadingStatus"
        :cards-summary="cardsSummaryWithLoadingStatus?.cardsSummary"
        :number-of-cards="set.settings.numberOfCards"
      />
    </template>
  </ItemsListItem>
</template>

<script setup lang="ts">
import { type PropType, useTemplateRef, onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { SetDto } from '@shared/data/trpc/SetDto'

import SetsListItemCardsSummary from '@/components/setsList/components/SetsListItemCardsSummary.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import type { CardsSummaryWithLoadingStatus } from '@/data/CardsSummaryWithLoadingStatus'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import { encodeCardsSetSettingsFromDto } from '@/utils/cardsSetSettings'
import ItemsListItem from '@/components/itemsList/ItemsListItem.vue'

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

const cardsSummaryLoadingStatus = computed(() => {
  switch (props.cardsSummaryWithLoadingStatus?.status) {
    case undefined:
    case 'notLoaded':
    case 'loading':
      return 'loading'
    case 'needsReload':
    case 'reloading':
    case 'success':
      return 'showData'
    case 'error':
    default:
      return 'error'
  }
})

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
