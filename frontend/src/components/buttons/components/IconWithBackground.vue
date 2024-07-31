<template>
  <span
    class="rounded-full flex items-center justify-center"
    :class="{
      'bg-bluegrey text-white': variant === 'bluegrey',
      'bg-yellow text-bluegrey': variant === 'yellow',
    }"
  >
    <IconAnimatedLoadingWheel
      v-if="props.icon === 'loading'"
      class="rtl:-scale-x-100"
      :color="props.variant === 'bluegrey' ? 'white' : 'bluegrey'"
    />
    <IconArrowRight
      v-else-if="props.icon === 'arrow'"
      class="rtl:-scale-x-100"
    />
    <IconPlay
      v-else-if="props.icon === 'play'"
      class="rtl:-scale-x-100"
    />
    <IconPlus
      v-else-if="props.icon === 'plus'"
    />
  </span>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconAnimatedLoadingWheel from '@/components/icons/IconAnimatedLoadingWheel.vue'

export type IconType = 'arrow' | 'loading' | 'play' | 'plus'
export type IconVariant = 'bluegrey' | 'yellow'

const props = defineProps({
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
