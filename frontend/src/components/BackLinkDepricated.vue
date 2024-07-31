<template>
  <div
    v-if="showBacklink"
  >
    <LinkDefault
      :to="to"
      target="_self"
      @click="onBacklinkClick"
    >
      <i class="bi bi-caret-left-fill rtl:hidden" /><!--
      --><i class="bi bi-caret-right-fill ltr:hidden" /><!--
      -->{{ t('general.back') }}
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import useBacklink from '@/modules/useBackLink'

const { t } = useI18n()

const { showBacklink, to, onBacklinkClick } = useBacklink()
</script>
