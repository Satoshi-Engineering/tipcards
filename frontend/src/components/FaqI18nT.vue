<template>
  <I18nT :keypath="keypath">
    <template #email>
      <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">{{ SUPPORT_EMAIL }}</LinkDefault>
    </template>
  </I18nT>
</template>

<script setup lang="tsx">
import { I18nT } from 'vue-i18n'

import LinkDefault from './typography/LinkDefault.vue'
import { SUPPORT_EMAIL } from '@/constants'

defineProps({
  keypath: {
    type: String,
    required: true,
  },
})
</script>
