<template>
  <div
    class="min-h-screen flex flex-col items-center"
    :dir="currentTextDirection"
  >
    <slot name="header">
      <TheHeader class="w-full max-w-3xl print:hidden" />
    </slot>
    <slot name="content-outer">
      <div class="grid justify-items-center w-full max-w-3xl">
        <slot name="content-inner">
          <div class="px-5 py-3">
            <slot name="default" />
          </div>
        </slot>
      </div>
    </slot>
    <slot name="footer">
      <TheMostFrequentFAQs
        v-if="!hideFAQs"
        class="w-full max-w-lg mb-px print:hidden"
      />
      <TheFooter class="w-full max-w-lg print:hidden" />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useI18nHelpers } from '@/modules/initI18n'

import TheHeader from './TheHeader.vue'
import TheFooter from './TheFooter.vue'
import TheMostFrequentFAQs from './TheMostFrequentFAQs.vue'

defineProps({
  hideFAQs: {
    type: Boolean,
    default: false,
  },
})

const { currentTextDirection } = useI18nHelpers()
</script>
