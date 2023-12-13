<template>
  <div class="min-h-screen flex flex-col" :dir="currentTextDirection">
    <slot
      v-if="!hideHeader"
      name="header"
    >
      <DefaultHeader />
    </slot>
    <slot name="default" />
    <slot name="footer">
      <DefaultFooter />
    </slot>
  </div>
</template>

<script setup lang="ts">
import { useI18nHelpers } from '@/modules/initI18n'

import DefaultHeader from './components/DefaultHeader.vue'
import DefaultFooter from './components/DefaultFooter.vue'

defineProps({
  hideHeader: {
    type: Boolean,
    default: false,
  },
})

const { currentTextDirection } = useI18nHelpers()
</script>
