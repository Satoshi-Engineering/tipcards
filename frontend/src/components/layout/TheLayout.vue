<template>
  <div class="min-h-screen flex flex-col">
    <slot name="header">
      <TheHeader
        class="print:hidden"
      />
    </slot>
    <div class="flex-1">
      <slot name="default" />
    </div>
    <slot name="footer">
      <TheMostRelevantFAQs
        v-if="!hideFAQs"
        class="print:hidden"
        :faqs="faqs"
      />
      <TheFooter class="print:hidden" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheMostRelevantFAQs from '@/components/layout/TheMostRelevantFAQs.vue'

defineProps({
  hideFAQs: {
    type: Boolean,
    default: false,
  },
  faqs: {
    type: Array as PropType<{ question: string, answer: string }[]>,
    default: undefined,
    validator: (value: { question: string, answer: string }[]) => value.length <= 3,
  },
})
</script>
