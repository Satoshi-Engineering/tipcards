<template>
  <div>
    <LightningQrCode
      :value="bulkWithdraw.lnurl"
      :success="bulkWithdraw.withdrawn != null"
      :pending="bulkWithdraw.withdrawPending || resetting"
    />
    <div class="flex justify-center">
      <ButtonWithTooltip
        type="submit"
        variant="outline"
        :disabled="resetting"
        @click="$emit('reset')"
      >
        {{ $t('bulkWithdraw.buttonReset') }} 
      </ButtonWithTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

import type { BulkWithdraw } from '@backend/trpc/data/BulkWithdraw'

import ButtonWithTooltip from '@/components/ButtonWithTooltip.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'

defineProps({
  bulkWithdraw: {
    type: Object as PropType<BulkWithdraw>,
    required: true,
  },
  resetting: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['reset'])
</script>
