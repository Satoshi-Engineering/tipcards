<template>
  <RouterLink
    v-if="to != null"
    class="break-anywhere"
    :class="{
      'font-bold': !noBold,
      'underline hover:no-underline': !invertUnderline,
      'no-underline hover:underline': invertUnderline,
      'opacity-50 pointer-events-none cursor-default': disabled,
    }"
    :to="to"
    :active-class="activeClass"
    :target="targetComputed"
    :disabled="disabled"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href != null"
    class="cursor-pointer break-anywhere"
    :class="{
      'font-bold': !noBold,
      'underline hover:no-underline': !invertUnderline,
      'no-underline hover:underline': invertUnderline,
      'opacity-50 pointer-events-none cursor-default': disabled,
    }"
    :href="href"
    :target="targetComputed"
    tabindex="0"
  >
    <slot>
      {{ href }}
    </slot>
  </a>
  <button
    v-else
    class="[text-align:inherit] cursor-pointer appearance-none break-anywhere"
    :class="{
      'font-bold': !noBold,
      'underline hover:no-underline': !invertUnderline,
      'no-underline hover:underline': invertUnderline,
      'opacity-50 pointer-events-none cursor-default': disabled,
    }"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const props = defineProps({
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
