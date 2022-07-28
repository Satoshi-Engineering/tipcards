<template>
  <button
    v-if="href == null"
    :class="cssClasses"
  >
    <slot />
  </button>
  <a
    v-else
    :href="href"
    :target="targetComputed"
    class="inline-block"
    :class="cssClasses"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const cssClasses = 'bg-btcorange my-1 px-5 py-2 text-white rounded-sm hover:bg-btcorange-effect active:btcorange-effect'

const props = defineProps({
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
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
