<template>
  <TooltipDefault
    class="ms-1"
    :content="$t(
      isSharedFunding ? 'funding.form.feeInfoShared' : 'funding.form.feeInfo',
      {
        fee: `${100 * FEE_PERCENTAGE}`,
        minimumFeeAmountAndUnit: $t('general.amountAndUnitSats', {amount: minimumFeeAmount }, minimumFeeAmount),
      },
    )"
  >
    <IconInfoCircle class="w-4 text-yellow" />
  </TooltipDefault>
</template>

<script setup lang="ts">
import { FEE_PERCENTAGE } from '@shared/constants'
import { calculateFeeForCard } from '@shared/modules/feeCalculation'

import TooltipDefault from '@/components/TooltipDefault.vue'
import IconInfoCircle from '@/components/icons/IconInfoCircle.vue'
import { computed } from 'vue'

const props = defineProps({
  minimumCardAmount: {
    type: Number,
    required: true,
  },
  isSharedFunding: {
    type: Boolean,
    default: false,
  },
})

const minimumFeeAmount = computed(() => calculateFeeForCard(props.minimumCardAmount))
</script>
