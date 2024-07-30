<template>
  <RouterLink
    v-if="to != null"
    :to="to"
    :target="targetComputed"
    :disabled="disabledComputed"
    class="inline-flex items-center group"
    :class="{ 'gap-1': !isSlotEmpty }"
  >
    <span
      class="inline"
      :class="cssClasses"
    >
      <AnimatedLoadingWheel
        v-if="loading"
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
    <span :class="linkTextClasses">
      <slot />
    </span>
  </RouterLink>
  <a
    v-else-if="href != null"
    class="inline-flex items-center group"
    :class="{ 'gap-1': !isSlotEmpty }"
    :href="href"
    :target="targetComputed"
  >
    <span
      class="inline"
      :class="cssClasses"
    >
      <AnimatedLoadingWheel
        v-if="loading"
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
    <span :class="linkTextClasses">
      <slot />
    </span>
  </a>
  <button
    v-else
    class="inline-flex items-center group"
    :class="{ 'gap-1': !isSlotEmpty }"
  >
    <span :class="cssClasses">
      <AnimatedLoadingWheel
        v-if="loading"
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
    <span :class="linkTextClasses">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import IconArrowRight from '@/components/icons/IconArrowRight.vue'
import IconPlay from '@/components/icons/IconPlay.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
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
    type: String as PropType<'arrow' | 'play' | 'plus'>,
    default: 'arrow',
  },
  size: {
    type: String as PropType<'default' | 'small'>,
    default: 'default',
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
const linkTextClasses = ref('group-hover:underline text-left')
const cssClasses = computed(() => [
  `
    rounded-full
    flex items-center justify-center
    group-hover:opacity-90
  `,
  {
    'opacity-50 cursor-default pointer-events-none': disabledComputed.value,
  },
  ...(props.variant === 'bluegrey' ? cssClassesBluegrey.value : cssClassesYellow.value),
  cssClassesSize.value,
])

const cssClassesSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-[20px] h-[20px]'
    case 'default':
      return 'w-[30px] h-[30px]'
    default:
      throw new Error(`Size not implemented: ${props.size}`)
  }
})

const cssClassesBluegrey = computed(() => [
  'bg-bluegrey text-white',
])

const cssClassesYellow = computed(() => [
  'bg-yellow text-bluegrey',
])

const isSlotEmpty = computed(() => {
  const slotContent = useSlots().default?.()
  return !slotContent || slotContent.length === 0
})

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
