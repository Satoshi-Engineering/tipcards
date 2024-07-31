<template>
  <div
    class="pb-6"
  >
    <LinkDefault
      :to="to"
      :no-bold="true"
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
import { computed, useSlots, type PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import IconCaretLeft from '@/components/icons/IconCaretLeft.vue'
import IconCaretRight from '@/components/icons/IconCaretRight.vue'

const { t } = useI18n()

defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
})

const isSlotEmpty = computed(() => {
  const slotContent = useSlots().default?.()
  return !slotContent || slotContent.length === 0
})
</script>
