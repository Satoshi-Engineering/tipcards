<template>
  <div class="text-center">
    <input
      :value="amount"
      class="border p-2"
      type="number"
      inputmode="decimal"
      :step="inputStep"
      @input="onInput"
    >
    <button
      type="button"
      class="p-3"
      :disabled="alternateAmount == null"
      @click="changeSelectedCurrency"
    >
      {{ selectedCurrency }}
      <i class="bi bi-arrow-down-up" />
    </button>
    <div
      class="text-sm"
      :class="{ 'invisible': alternateAmount == null }"
    >
      {{ alternateAmount }} {{ alternateCurrency }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'

import formatNumber from '@/modules/formatNumber'

const rateBtcSats = 100 * 1000 * 1000

const selectedCurrency = ref<string>('sats')
const alternateCurrency = computed(() => selectedCurrency.value === 'EUR' ? 'BTC' : 'EUR')
const amount = ref<string>()

const alternateAmount = computed(() => {
  if (props.rateBtcEur == null) {
    return undefined
  }
  if (alternateCurrency.value === 'EUR') {
    return formatNumber(props.amountSats / rateBtcSats * props.rateBtcEur, 2, 2)
  }
  return formatNumber(props.amountSats / rateBtcSats, 8, 8)
})

const inputStep = computed(() => {
  if (selectedCurrency.value === 'sats') {
    return 1
  }
  if (selectedCurrency.value === 'EUR') {
    return 0.01
  }
  return 0.00000001
})

const props = defineProps({
  amountSats: {
    type: Number,
    required: true,
  },
  rateBtcEur: {
    type: Number,
    default: undefined,
  },
})

const emit = defineEmits([
  'update',
])

const onInput = (event: Event) => {
  const { value } = (event.target as HTMLInputElement)
  amount.value = value
  let amountSats = 0
  if (selectedCurrency.value === 'sats') {
    amountSats = Number(value)
  }
  if (selectedCurrency.value === 'BTC') {
    amountSats = Number(value) * rateBtcSats
  }
  if (selectedCurrency.value === 'EUR' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    amountSats = Number(value) * rateBtcSats / props.rateBtcEur
  }
  emit('update', Math.round(amountSats))
}

const changeSelectedCurrency = () => {
  if (selectedCurrency.value === 'sats') {
    selectedCurrency.value = 'EUR'
    return
  }
  if (selectedCurrency.value === 'EUR') {
    selectedCurrency.value = 'BTC'
    return
  }
  selectedCurrency.value = 'sats'
}

const initAmount = () => {
  if (selectedCurrency.value === 'sats') {
    amount.value = String(props.amountSats)
    return
  }
  if (selectedCurrency.value === 'EUR' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    amount.value = formatNumber(props.amountSats / rateBtcSats * props.rateBtcEur, 2, 2, undefined, 'en')
    return
  }
  amount.value = formatNumber(props.amountSats / rateBtcSats, 8, 8, undefined, 'en')
}

onBeforeMount(initAmount)
watch(selectedCurrency, initAmount)
</script>
