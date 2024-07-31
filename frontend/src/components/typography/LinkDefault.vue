<template>
  <ButtonLinkSkeleton
    :to="to"
    :href="href"
    :target="target"
    :disabled="disabled"
    :active-class="activeClass"
    :class="{
      'font-bold': !noBold,
      'underline hover:no-underline': !invertUnderline,
      'no-underline hover:underline': invertUnderline,
    }"
    class="cursor-pointer break-anywhere"
  >
    <slot />
  </ButtonLinkSkeleton>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import ButtonLinkSkeleton from '@/components/buttons/components/ButtonLinkSkeleton.vue'

defineProps({
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  activeClass: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  noBold: {
    type: Boolean,
    default: false,
  },
  invertUnderline: {
    type: Boolean,
    default: false,
  },
})
</script>
