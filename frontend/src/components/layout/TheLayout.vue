<template>
  <div
    class="min-h-screen flex flex-col"
    :dir="currentTextDirection"
  >
    <slot name="header">
      <TheHeader
        class="print:hidden"
        :current-code="currentCode"
        :locales="locales"
      />
    </slot>
    <div class="flex-1">
      <slot name="default" />
    </div>
    <slot name="footer">
      <TheMostFrequentFAQs
        v-if="!hideFAQs"
        class="print:hidden"
      />
      <TheFooter class="print:hidden" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import TheMostFrequentFAQs from '@/components/layout/TheMostFrequentFAQs.vue'
import { useI18nHelpers } from '@/modules/initI18n'
import type { Locales } from '@/modules/langNav/Locales'

defineProps({
  hideFAQs: {
    type: Boolean,
    default: false,
  },
  locales: {
    type: Array as PropType<Locales>,
    default: () => [],
  },
  currentCode: {
    type: String,
    default: '',
  },
})

const { currentTextDirection } = useI18nHelpers()
</script>
