<template>
  <div class="flex my-2">
    <div class="mb-0 flex-1 font-lato text-start" :class="{ 'font-bold': strong }">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="text-end">
      <div :class="{ 'font-bold': strong, 'text-sm': !strong }">
        {{ amountPrimary }} {{ selectedCurrencyDisplay }}
      </div>
      <small
        class="block text-xs"
        :class="{ 'invisible': amountSecondary == null }"
      >
        {{ amountSecondary }} {{ secondaryCurrencyDisplay }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, type PropType } from 'vue'

import { useAmountConversion, type SelectedCurrency } from '@/modules/useAmountConversion'

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
