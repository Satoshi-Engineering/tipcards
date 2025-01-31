<template>
  <div class="flex my-2">
    <div class="mb-0 flex-1 font-lato text-start" :class="{ 'font-bold': strong }">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="text-end">
      <div :class="{ 'font-bold': strong, 'text-sm': !strong }">
        {{ primaryFigure }}
      </div>
      <small
        class="block text-xs"
        :class="{ 'invisible': secondaryFigure == null }"
      >
        {{ secondaryFigure ?? 'nbsp;' }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: undefined,
  },
  primaryFigure: {
    type: String,
    default: undefined,
  },
  secondaryFigure: {
    type: String,
    default: undefined,
  },
  strong: {
    type: Boolean,
    default: false,
  },
})
</script>
