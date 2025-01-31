<template>
  <FundingDetailsItem
    :strong="strong"
    :primary-figure="`${amountPrimary} ${selectedCurrencyDisplay}`"
    :secondary-figure="amountSecondary != null ? `${amountSecondary} ${secondaryCurrencyDisplay}` : undefined"
  >
    <template #label>
      <slot name="label">
        {{ label }}
      </slot>
    </template>
  </FundingDetailsItem>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'

import { useAmountConversion, type SelectedCurrency } from '@/modules/useAmountConversion'
import FundingDetailsItem from './FundingDetailsItem.vue'

const props = defineProps({
  label: {
    type: String,
    default: undefined,
  },
  strong: {
    type: Boolean,
    default: false,
  },
  amountSats: {
    type: Number,
    default: undefined,
  },
  rateBtcFiat: {
    type: Number,
    default: undefined,
  },
  selectedCurrency: {
    type: String as PropType<SelectedCurrency>,
    default: 'sats',
  },
  fiatCurrency: {
    type: String,
    default: 'EUR',
  },
})

const { rateBtcFiat, fiatCurrency, selectedCurrency } = toRefs(props)

const { satsToPrimary, satsToSecondary, selectedCurrencyDisplay, secondaryCurrencyDisplay } = useAmountConversion({
  fiatCurrency,
  selectedCurrency,
  rateBtcFiat,
})

const amountPrimary = computed(() => props.amountSats != null ? satsToPrimary(props.amountSats) : '')
const amountSecondary = computed(() => props.amountSats != null ? satsToSecondary(props.amountSats) : '')
</script>
