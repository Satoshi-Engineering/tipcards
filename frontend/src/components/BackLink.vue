<template>
  <div
    v-if="showBacklink"
    class="pb-6"
  >
    <LinkDefault
      :to="to"
      target="_self"
      :no-bold="true"
      @click="onBacklinkClick"
    >
      <div class="flex gap-1 items-center">
        <IconCaretLeft class="w-3 h-3 rtl:hidden" />
        <IconCaretRight class="w-3 h-3 ltr:hidden" />
        <span v-if="isSlotEmpty">
          {{ t('general.back') }}
        </span>
        <span v-else>
          <slot />
        </span>
      </div>
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { useI18n } from 'vue-i18n'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import useBacklink from '@/modules/useBackLink'
import IconCaretLeft from '@/components/icons/IconCaretLeft.vue'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'

const { t } = useI18n()

const { showBacklink, to, onBacklinkClick } = useBacklink()

const isSlotEmpty = computed(() => {
  const slotContent = useSlots().default?.()
  return !slotContent || slotContent.length === 0
})
</script>
