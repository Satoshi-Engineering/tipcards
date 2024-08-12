<template>
  <ButtonLinkSkeleton
    :to="to"
    :href="href"
    :target="target"
    :class="cssClassesContainer"
    :disabled="disabledComputed"
    :element="element"
  >
    <span :class="cssClassesIcon">
      <IconWithBackground
        class="w-full h-full"
        :icon="loading ? 'loading' : props.icon"
        :variant="props.variant"
      />
    </span>
    <span v-if="$slots.default != null">
      <slot />
    </span>
  </ButtonLinkSkeleton>
</template>

<script setup lang="ts">
import { computed, useSlots, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import IconWithBackground, { type IconType, type IconVariant } from '@/components/buttons/components/IconWithBackground.vue'

import ButtonLinkSkeleton from './components/ButtonLinkSkeleton.vue'

export type ButtonIconSize = 'default' | 'small'

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
    type: String as PropType<IconVariant>,
    default: 'bluegrey',
  },
  icon: {
    type: String as PropType<IconType>,
    default: 'arrow',
  },
  size: {
    type: String as PropType<ButtonIconSize>,
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
  element: {
    type: String as PropType<'span'>,
    default: undefined,
  },
})

const disabledComputed = computed(() => props.disabled || props.loading)
const cssClassesContainer = computed(() => [
  'inline-flex items-center underline group',
  {
    'hover:no-underline': !disabledComputed.value,
    'opacity-50 cursor-default pointer-events-none': disabledComputed.value,
    'gap-1': !isSlotEmpty.value,
  },
])

const cssClassesIcon = computed(() => [
  {
    'group-hover:opacity-90': !disabledComputed.value,
  },
  cssClassesSize.value,
])

const cssClassesSize = computed(() => {
  switch (props.size) {
    case 'small':
      return 'w-[20px] h-[20px]'
    case 'default':
      return 'w-[30px] h-[30px]'
    default:
      throw new Error(`ButtonIconSize not implemented: ${props.size}`)
  }
})

const isSlotEmpty = computed(() => {
  const slotContent = useSlots().default?.()
  return !slotContent || slotContent.length === 0
})
</script>
