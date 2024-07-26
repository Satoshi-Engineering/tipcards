<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    :class="cssClasses"
    :target="targetComputed"
    :disabled="disabledComputed"
  >
    <AnimatedLoadingWheel
      v-if="loading"
      class="block w-5 h-5"
      :color="props.variant === 'bluegrey' ? 'white' : 'bluegrey'"
    />
    <IconArrowRight
      v-else-if="props.icon === 'arrow'"
      class="w-4 rtl:-scale-x-100"
    />
    <IconPlay
      v-else-if="props.icon === 'play'"
      class="w-[12px] ms-[3px] rtl:-scale-x-100"
    />
  </RouterLink>
  <a
    v-else-if="href != null"
    :href="href"
    :target="targetComputed"
    class="inline-block"
    :class="cssClasses"
  >
    <AnimatedLoadingWheel
      v-if="loading"
      class="block w-5 h-5"
      :color="props.variant === 'bluegrey' ? 'white' : 'bluegrey'"
    />
    <IconArrowRight
      v-else-if="props.icon === 'arrow'"
      class="w-4 rtl:-scale-x-100"
    />
    <IconPlay
      v-else-if="props.icon === 'play'"
      class="w-[12px] ms-[3px] rtl:-scale-x-100"
    />
  </a>
  <button
    v-else
    :class="cssClasses"
  >
    <AnimatedLoadingWheel
      v-if="loading"
      class="block w-5 h-5"
      :color="props.variant === 'bluegrey' ? 'white' : 'bluegrey'"
    />
    <IconArrowRight
      v-else-if="props.icon === 'arrow'"
      class="w-4 rtl:-scale-x-100"
    />
    <IconPlay
      v-else-if="props.icon === 'play'"
      class="w-[12px] ms-[3px] rtl:-scale-x-100"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import AnimatedLoadingWheel from '@/components/AnimatedLoadingWheel.vue'

const props = defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  variant: {
    type: String as PropType<'bluegrey' | 'yellow'>,
    default: 'bluegrey',
  },
  icon: {
    type: String as PropType<'arrow' | 'play'>,
    default: 'arrow',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  reducedAnimation: {
    type: Boolean,
    default: false,
  },
})

const disabledComputed = computed(() => props.disabled || props.loading)

const cssClasses = computed(() => [
  `
    w-[30px] h-[30px] rounded-full
    flex items-center justify-center
    hover:opacity-90
  `,
  {
    'opacity-50 cursor-default pointer-events-none': disabledComputed.value,
  },
  ...(props.variant === 'bluegrey' ? cssClassesBluegrey.value : cssClassesYellow.value),
])

const cssClassesBluegrey = computed(() => [
  'bg-bluegrey text-white',
])

const cssClassesYellow = computed(() => [
  'bg-yellow text-bluegrey',
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
