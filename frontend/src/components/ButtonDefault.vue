<template>
  <button
    v-if="href == null"
    :class="cssClasses"
    :disabled="disabled"
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
import { computed, type PropType } from 'vue'

const props = defineProps({
  href: {
    type: String,
    default: undefined,
  },
  target: {
    type: String,
    default: undefined,
  },
  variant: {
    type: String as PropType<'outline' | 'no-border' | undefined>,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const cssClasses = [
  'border-2 border-btcorange my-1 px-5 py-2 text-white rounded-sm transition-colors',
  {
    'bg-btcorange text-white hover:bg-btcorange-effect active:bg-btcorange-effect': props.variant == null,
    'bg-transparent text-btcorange': props.variant === 'outline',
    'bg-transparent text-btcorange border-transparent px-0': props.variant === 'no-border',
    'opacity-50 cursor-default pointer-events-none': props.disabled,
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
