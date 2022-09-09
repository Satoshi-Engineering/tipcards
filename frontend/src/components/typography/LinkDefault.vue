<template>
  <RouterLink
    v-if="to != null"
    class="underline hover:no-underline break-anywhere"
    :class="{ 'font-bold': bold }"
    :to="to"
    :target="targetComputed"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href != null"
    class="underline hover:no-underline cursor-pointer break-anywhere"
    :class="{ 'font-bold': bold }"
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
    class="[text-align:inherit] underline hover:no-underline cursor-pointer appearance-none break-anywhere"
    :class="{ 'font-bold': bold }"
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
  bold: {
    type: Boolean,
    default: true,
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
