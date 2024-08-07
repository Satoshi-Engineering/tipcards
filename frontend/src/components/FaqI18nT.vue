<template>
  <I18nT :keypath="keypath">
    <template #supportEmail>
      <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">
        {{ SUPPORT_EMAIL }}
      </LinkDefault>
    </template>
    <template #lightningNode>
      &#32;<LinkDefault :href="LIGHTNING_NODE_LINK">
        {{ LIGHTNING_NODE_NAME }}
      </LinkDefault>
    </template>
  </I18nT>
</template>

<script setup lang="ts">
import { I18nT } from 'vue-i18n'

import LinkDefault from './typography/LinkDefault.vue'
import { SUPPORT_EMAIL, LIGHTNING_NODE_NAME, LIGHTNING_NODE_LINK } from '@/constants'

defineProps({
  keypath: {
    type: String,
    required: true,
  },
})
</script>
