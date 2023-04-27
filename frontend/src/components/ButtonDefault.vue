<template>
  <button
    v-if="href == null"
    :class="cssClasses"
    :disabled="disabled"
  >
    <slot />
    <AnimatedLoadingWheel
      v-if="loading"
      class="inline-block w-5 h-5 ml-3 -mt-1"
      color="white"
    />
  </button>
  <a
    v-else
    :href="href"
    :target="targetComputed"
    class="inline-block"
    :class="cssClasses"
  >
    <slot />
    <AnimatedLoadingWheel
      v-if="loading"
      class="inline-block w-5 h-5 ml-3 -mt-1"
      color="white"
    />
  </a>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'

const props = defineProps({
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  variant: {
    type: String as PropType<'outline' | 'no-border' | undefined>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const cssClasses = computed(() => [
  'border-2 border-btcorange my-1 py-2 text-center rounded-sm transition-colors duration-200',
  {
    'px-5': props.variant !== 'no-border',
    'bg-btcorange text-white active:bg-btcorange-effect active:border-btcorange-effect': props.variant == null,
    'hover:bg-btcorange-effect hover:border-btcorange-effect': props.variant == null && !props.disabled,
    'bg-transparent text-btcorange': props.variant === 'outline',
    'bg-transparent text-btcorange border-transparent px-0': props.variant === 'no-border',
    'opacity-50 cursor-default pointer-events-none': props.disabled,
  },
])

const targetComputed = computed(() => {
  if (props.target != null) {
    return props.target
  }
  if (props.href != null && /^https?:\/\/.+/.test(props.href)) {
    return '_blank'
  }
  return undefined
})
</script>
