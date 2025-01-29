<template>
  <div
    class="my-2 py-4 border rounded-default"
    :class="{
      'border-red-500': status === 'error',
      'border-green-500': status === 'success',
      'border-yellow': status === 'pending'
    }"
  >
    <div class="text-center">
      <div class="font-bold">
        <FormatBitcoin
          v-if="selectedCurrency === 'BTC' && amountPrimaryNumber != null"
          :value="amountPrimaryNumber"
          leading-zeros-class="text-white-50"
        />
        <template v-else>
          {{ amountPrimaryString }}
        </template>
        {{ selectedCurrencyDisplay }}
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
import FormatBitcoin from './FormatBitcoin.vue'

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
    default: 'BTC',
  },
  fiatCurrency: {
    type: String,
    default: 'EUR',
  },
  status: {
    type: String,
    default: 'pending',
  },
})

const { rateBtcFiat, fiatCurrency, selectedCurrency } = toRefs(props)

const { satsToPrimary, satsToSecondary, selectedCurrencyDisplay, secondaryCurrencyDisplay } = useAmountConversion({
  fiatCurrency,
  selectedCurrency,
  rateBtcFiat,
})

const amountPrimaryNumber = computed(() => props.amountSats != null ? Number(satsToPrimary(props.amountSats, 'en')) : undefined)
const amountPrimaryString = computed(() => props.amountSats != null ? satsToPrimary(props.amountSats) : '')
const amountSecondary = computed(() => props.amountSats != null ? satsToSecondary(props.amountSats) : '')
</script>
