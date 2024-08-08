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
export type HeadlineStyling = 'h1' | 'h2' | 'h3' | 'h4' | 'none'

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
  h1: 'font-lato text-3xl my-6 text-black',
  h2: 'font-lato text-2xl my-4 text-black',
  h3: 'font-lato text-xl my-3',
  h4: 'text-base my-3',
  none: '',
}

const classes = computed(() => {
  if (props.styling === 'none') {
    return ''
  }
  const baseClasses = 'first:mt-0 last:mb-0 font-bold'
  if (props.styling != null) {
    return `${baseClasses} ${classesByLevel[props.styling]}`
  }
  if (props.level !== 'blockquote') {
    return `${baseClasses} ${classesByLevel[props.level]}`
  }
  return baseClasses
})
</script>
