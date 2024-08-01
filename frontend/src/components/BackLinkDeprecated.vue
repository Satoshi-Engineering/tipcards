<template>
  <div
    v-if="showBacklink"
  >
    <LinkDefault
      :to="to"
      no-bold
      target="_self"
      @click="onBacklinkClick"
    >
      <span class="flex gap-1 items-center">
        <IconCaretLeft class="w-3 h-3 rtl:hidden" />
        <IconCaretRight class="w-3 h-3 ltr:hidden" />
        <span v-if="$slots.default == null">
          {{ t('general.back') }}
        </span>
        <span v-else>
          <slot />
        </span>
      </span>
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import LinkDefault from '@/components/typography/LinkDefault.vue'
import useBacklink from '@/modules/useBackLink'
import IconCaretLeft from './icons/IconCaretLeft.vue'
import IconCaretRight from './icons/IconCaretRight.vue'

const { t } = useI18n()

const { showBacklink, to, onBacklinkClick } = useBacklink()
</script>
