<template>
  <TooltipDefault
    :content="tooltip"
    placement="top"
  >
    <ButtonDefault
      v-bind="$attrs"
      :href="href"
      :target="target"
      :variant="variant"
      :disabled="disabled"
      @click="$emit('click')"
    >
      <slot name="default" />
    </ButtonDefault>
  </TooltipDefault>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import TooltipDefault from './TooltipDefault.vue'
import ButtonDefault from './ButtonDefault.vue'

defineProps({
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
  tooltip: {
    type: String,
    default: undefined,
  },
})

defineEmits([
  'click',
])

</script>
