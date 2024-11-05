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
    <SetCardsInfo
      v-if="!noCardsInfo"
      class="col-start-2 row-start-2 row-span-2 mb-1 place-self-end"
      data-test="sets-list-item-cards-info"
      :cards-info="cardsInfo"
      :number-of-cards="set.settings.numberOfCards"
    />
  </LinkDefault>
</template>

<script setup lang="ts">
import { type PropType, useTemplateRef, onMounted, onUnmounted, ref, watch } from 'vue'

import type { SetDto } from '@shared/data/trpc/SetDto'
import type { SetCardsInfoDto } from '@shared/data/trpc/SetCardsInfoDto'

import useSets from '@/modules/useSets'
import SetCardsInfo from '@/pages/sets/components/SetCardsInfo.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import IconTipCardSet from '@/components/icons/IconTipCardSet.vue'
import useSetDisplayInfo from '@/pages/sets/modules/useSetDisplayInfo'

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

const SetDisplayInfo = useSetDisplayInfo()
const setDisplayInfo = SetDisplayInfo.create(props.set)
</script>
