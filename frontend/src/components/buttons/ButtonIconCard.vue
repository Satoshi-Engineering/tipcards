<template>
  <ButtonLinkSkeleton
    class="group flex flex-row gap-4 items-stretch"
    :class="{
      'opacity-50 cursor-default pointer-events-none': disabled,
    }"
    :to="to"
    :href="href"
    :target="target"
    :disabled="disabled"
  >
    <div
      class="
        inline-flex justify-center items-center
        min-w-[40px] max-w-sm
        min-h-[40px]
        rounded-default overflow-hidden
        shadow-default group-hover:shadow-default-flat
      "
      :class="[iconClass, { 'flex-1': $slots.description == null }]"
    >
      <slot />
    </div>
    <div
      v-if="$slots.description != null"
      :class="descriptionClass"
    >
      <slot name="description" />
    </div>
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
  iconClass: {
    type: String,
    default: '',
  },
  descriptionClass: {
    type: String,
    default: '',
  },
})
</script>
