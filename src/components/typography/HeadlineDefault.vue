<template>
  <h1
    v-if="level === 'h1'"
    :class="[$attrs.class, classes]"
    v-bind="$attrs"
  >
    <slot />
  </h1>
  <h2
    v-if="level === 'h2'"
    :class="[$attrs.class, classes]"
    v-bind="$attrs"
  >
    <slot />
  </h2>
  <h3
    v-if="level === 'h3'"
    :class="[$attrs.class, classes]"
    v-bind="$attrs"
  >
    <slot />
  </h3>
  <h4
    v-if="level === 'h4'"
    :class="[$attrs.class, classes]"
    v-bind="$attrs"
  >
    <slot />
  </h4>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'

const props = defineProps({
  level: {
    type: String as PropType<'h1' | 'h2' | 'h3' | 'h4'>,
    required: true,
  },
  styling: {
    type: String as PropType<'h1' | 'h2' | 'h3' | 'h4'>,
    default: undefined,
  },
})

const classesByLevel: Record<string, string> = {
  h1: 'text-3xl my-6 first:mt-0 last:mb-0 font-semibold',
  h2: 'text-2xl my-4 first:mt-0 last:mb-0 font-bold',
  h3: 'text-base md:text-xl my-3 first:mt-0 last:mb-0 font-bold',
  h4: 'text-base my-3 first:mt-0 last:mb-0 font-bold',
}

const classes = computed(() =>  classesByLevel[props.styling || props.level])
</script>
