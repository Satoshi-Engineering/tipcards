<template>
  <div>
    <div class="flex items-end w-full">
      <div class="flex-1">
        <TextField
          :model-value="amount"
          :label="label || $t('general.amount')"
          class="w-full focus:outline-none"
          input-class="text-right"
          type="number"
          inputmode="decimal"
          :min="inputMin"
          :max="inputMax"
          :step="inputStep"
          @update:model-value="(value) => onInput(value)"
        />
      </div>
      <button
        type="button"
        class="p-4 w-20 h-14 flex items-center gap-2 underline hover:no-underline"
        :disabled="amountSecondary == null"
        @click="changeSelectedCurrency"
      >
        <IconConvert class="flex-none w-5 h-5" />
        <span>
          {{ selectedCurrencyDisplay }}
        </span>
      </button>
    </div>
    <div>
      <small
        class="block text-left text-sm"
        :class="{ 'invisible': amountSecondary == null }"
      >
        {{ amountSecondary }} {{ secondaryCurrencyDisplay }}
      </small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch, type PropType, toRefs } from 'vue'

import formatNumber from '@/modules/formatNumber'
import TextField from '@/components/forms/TextField.vue'
import IconConvert from './icons/IconConvert.vue'
import { useAmountConversion, type SelectedCurrency } from '@/modules/useAmountConversion'

const props = defineProps({
  amountSats: {
    type: Number,
    required: true,
  },
  selectedCurrency: {
    type: String as PropType<SelectedCurrency>,
    required: true,
  },
  rateBtcFiat: {
    type: Number,
    default: undefined,
  },
  fiatCurrency: {
    type: String,
    default: 'EUR',
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: undefined,
  },
  fee: {
    type: [Number, null],
    default: null,
  },
  label: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits([
  'update:amountSats',
  'update:selectedCurrency',
])

const rateBtcSats = 100 * 1000 * 1000

const { rateBtcFiat, fiatCurrency, selectedCurrency } = toRefs(props)

const { satsToPrimary, satsToSecondary, selectedCurrencyDisplay, secondaryCurrencyDisplay } = useAmountConversion({
  fiatCurrency,
  selectedCurrency,
  rateBtcFiat,
})

const initAmount = () => {
  amount.value = satsToPrimary(props.amountSats, 'en')
}

const onInput = (value?: number | string) => {
  if (value == 0) {
    return
  }
  amount.value = String(value)
  let amountSats = 0
  if (props.selectedCurrency === 'sats') {
    amountSats = Number(value)
  }
  if (props.selectedCurrency === 'BTC') {
    amountSats = Number(value) * rateBtcSats
  }
  if (props.selectedCurrency === 'fiat' && props.rateBtcFiat != null && props.rateBtcFiat > 0) {
    amountSats = Number(value) * rateBtcSats / props.rateBtcFiat
  }
  emit('update:amountSats', Math.round(amountSats))
}

const changeSelectedCurrency = () => {
  if (props.selectedCurrency === 'sats' && props.rateBtcFiat != null && props.rateBtcFiat > 0) {
    emit('update:selectedCurrency', 'fiat')
    return
  }
  if (props.selectedCurrency === 'sats' || props.selectedCurrency === 'fiat') {
    emit('update:selectedCurrency', 'BTC')
    return
  }
  emit('update:selectedCurrency', 'sats')
}

const amount = ref<string>()

const amountSecondary = computed(() => satsToSecondary(props.amountSats))

const inputStep = computed(() => {
  if (props.selectedCurrency === 'BTC') {
    return 0.00000001
  }
  if (props.selectedCurrency === 'fiat') {
    return 0.01
  }
  return 1
})

const inputMin = computed(() => {
  if (props.selectedCurrency === 'BTC') {
    return props.min / rateBtcSats
  }
  if (props.selectedCurrency === 'fiat' && props.rateBtcFiat != null && props.rateBtcFiat > 0) {
    return formatNumber(props.min / rateBtcSats * props.rateBtcFiat, 2, 2, undefined, 'en')
  }
  return props.min
})

const inputMax = computed(() => {
  if (props.max == null) {
    return undefined
  }
  if (props.selectedCurrency === 'BTC') {
    return props.max / rateBtcSats
  }
  if (props.selectedCurrency === 'fiat' && props.rateBtcFiat != null && props.rateBtcFiat > 0) {
    return formatNumber(props.max / rateBtcSats * props.rateBtcFiat, 2, 2, undefined, 'en')
  }
  return props.max
})

onBeforeMount(initAmount)
watch(() => props.selectedCurrency, initAmount)
</script>
