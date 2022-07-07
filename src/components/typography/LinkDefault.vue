<template>
  <RouterLink
    v-if="to != null"
    class="font-bold underline hover:no-underline break-anywhere"
    :to="to"
    :target="targetComputed"
  >
    <slot />
  </RouterLink>
  <a
    v-else-if="href != null"
    class="font-bold underline hover:no-underline cursor-pointer break-anywhere"
    :href="href"
    :target="targetComputed"
    tabindex="0"
  >
    <slot />
  </a>
  <button
    v-else
    class="font-bold [text-align:inherit] underline hover:no-underline cursor-pointer appearance-none break-anywhere"
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
