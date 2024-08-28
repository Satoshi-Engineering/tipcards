<template>
  <ButtonLinkSkeleton
    class="
      relative inline-flex justify-center items-center
      min-w-[40px] max-w-sm
      min-h-[40px] max-h-sm
      rounded-default overflow-hidden
      shadow-default hover:shadow-default-flat
    "
    :class="{
      'opacity-50 cursor-default pointer-events-none': disabled,
    }"
    :to="to"
    :href="href"
    :target="target"
    :disabled="disabled"
  >
    <slot />
  </ButtonLinkSkeleton>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import ButtonLinkSkeleton from './components/ButtonLinkSkeleton.vue'

defineProps({
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
  disabled: {
    type: Boolean,
    default: false,
  },
})
</script>
