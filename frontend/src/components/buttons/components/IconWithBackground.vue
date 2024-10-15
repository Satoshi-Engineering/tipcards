<template>
  <span
    class="rounded-full flex items-center justify-center"
    :class="{
      'bg-bluegrey text-white': variant === 'bluegrey',
      'bg-yellow text-bluegrey': variant === 'yellow',
      'p-[20%]': icon === 'loading',
      'p-[28%]': icon === 'arrow',
      'p-[22%]': icon === 'play',
      'p-[30%]': icon === 'plus',
      'p-[21%]': icon === 'search',
    }"
  >
    <IconAnimatedLoadingWheel
      v-if="icon === 'loading'"
      :color="variant === 'bluegrey' ? 'white' : 'bluegrey'"
    />
    <IconArrowRight
      v-else-if="icon === 'arrow'"
      class="rtl:-scale-x-100"
    />
    <IconPlay
      v-else-if="icon === 'play'"
      class="ml-1"
    />
    <IconPlus
      v-else-if="icon === 'plus'"
    />
    <IconSearch
      v-else-if="icon === 'search'"
    />
  </span>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'

export type IconType = 'arrow' | 'loading' | 'play' | 'plus' | 'search'
export type IconVariant = 'bluegrey' | 'yellow'

defineProps({
  variant: {
    type: String as PropType<IconVariant>,
    default: 'bluegrey',
    validator: (value: string) => ['bluegrey', 'yellow'].includes(value),
  },
  icon: {
    type: String as PropType<IconType>,
    default: 'arrow',
  },
})
</script>
