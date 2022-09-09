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

const props = defineProps({
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  outline: {
    type: Boolean,
    default: false,
  },
})

const cssClasses = [
  'border-2 border-btcorange my-1 px-5 py-2 text-white rounded-sm transition-colors',
  {
    'bg-btcorange text-white hover:bg-btcorange-effect active:bg-btcorange-effect': !props.outline,
    'bg-transparent text-btcorange hover:bg-btcorange-effect hover:text-white active:text-white': props.outline,
  },
]

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
