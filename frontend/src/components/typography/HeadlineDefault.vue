<template>
  <h1
    v-if="level === 'h1'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </h1>
  <h2
    v-if="level === 'h2'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </h2>
  <h3
    v-if="level === 'h3'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </h3>
  <h4
    v-if="level === 'h4'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </h4>
  <blockquote
    v-if="level === 'blockquote'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </blockquote>
</template>

<script setup lang="ts">

export type HeadlineLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'blockquote'
export type HeadlineStyling = 'h1' | 'h2' | 'h3' | 'h4'

import { computed, type PropType } from 'vue'

const props = defineProps({
  level: {
    type: String as PropType<HeadlineLevel>,
    required: true,
  },
  styling: {
    type: String as PropType<HeadlineStyling>,
    default: undefined,
  },
})

const classesByLevel: Record<HeadlineStyling, string> = {
  h1: 'text-3xl my-6',
  h2: 'text-2xl my-4',
  h3: 'text-xl my-3',
  h4: 'text-base my-3',
}

const classes = computed(() => {
  const baseClasses = 'first:mt-0 last:mb-0 font-lato font-bold'
  if (props.styling != null) {
    return `${baseClasses} ${classesByLevel[props.styling]}`
  }
  if (props.level !== 'blockquote') {
    return `${baseClasses} ${classesByLevel[props.level]}`
  }
  return baseClasses
})
</script>
