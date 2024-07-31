<template>
  <div
    class="rounded-full flex items-center justify-center"
    :class="cssClassesBackground"
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
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

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
  },
  icon: {
    type: String as PropType<IconType>,
    default: 'arrow',
  },
})

const cssClassesBackground = computed(() => {
  switch (props.variant) {
    case 'bluegrey':
      return 'bg-bluegrey text-white'
    case 'yellow':
      return 'bg-yellow text-bluegrey]'
    default:
      throw new Error(`IconVariant not implemented: ${props.variant}`)
  }
})

</script>
