<template>
  <div
    class="pb-6"
  >
    <LinkDefault
      v-bind="$attrs"
      :to="to"
      :autofocus="autofocus"
      no-bold
      @click="$emit('click')"
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
import type { PropType } from 'vue'
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
  autofocus: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])
</script>
