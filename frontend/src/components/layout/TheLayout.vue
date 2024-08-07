<template>
  <div
    class="min-h-dvh flex flex-col"
    data-test="the-layout"
  >
    <slot name="header">
      <TheHeader
        class="print:hidden"
      />
    </slot>
    <div class="flex-1">
      <slot name="default" />
    </div>
    <slot name="footer">
      <TheMostRelevantFaqs
        v-if="!hideFaqs"
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
import TheMostRelevantFaqs from '@/components/layout/theMostRelevantFaqs/TheMostRelevantFaqs.vue'
import type { Faq } from '@/modules/faqs'

defineProps({
  hideFaqs: {
    type: Boolean,
    default: false,
  },
  faqs: {
    type: Array as PropType<Faq[]>,
    default: undefined,
    validator: (value: Faq[]) => value.length <= 3,
  },
})
</script>
