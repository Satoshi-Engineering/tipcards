<template>
  <div class="flex items-start w-full">
    <div class="flex-1">
      <input
        :value="amount"
        class="w-full border my-1 px-3 py-2 focus:outline-none"
        type="number"
        inputmode="decimal"
        :min="inputMin"
        :max="inputMax"
        :step="inputStep"
        @input="onInput"
      >
      <small
        class="block text-left text-sm"
        :class="{ 'invisible': alternateAmount == null }"
      >
        {{ alternateAmount }} {{ alternateCurrency }}
      </small>
    </div>
    <button
      type="button"
      class="p-3"
      :disabled="alternateAmount == null"
      @click="changeSelectedCurrency"
    >
      {{ selectedCurrency }}
      <IconArrowDownUp class="inline h-[1em] w-[1em]" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, watch } from 'vue'

import IconArrowDownUp from '@/components/icons/IconArrowDownUp.vue'
import formatNumber from '@/modules/formatNumber'

const rateBtcSats = 100 * 1000 * 1000

const selectedCurrency = ref<string>('sats')
const alternateCurrency = computed(() => {
  if (selectedCurrency.value === 'EUR') {
    return 'BTC'
  }
  if (props.rateBtcEur != null && props.rateBtcEur > 0) {
    return 'EUR'
  }
  return selectedCurrency.value === 'sats' ? 'BTC' : 'sats'
})
const amount = ref<string>()

const alternateAmount = computed(() => {
  if (alternateCurrency.value === 'EUR' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    return formatNumber(props.amountSats / rateBtcSats * props.rateBtcEur, 2, 2)
  }
  if (alternateCurrency.value === 'BTC') {
    return formatNumber(props.amountSats / rateBtcSats, 8, 8)
  }
  return props.amountSats
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

const inputMin = computed(() => {
  if (selectedCurrency.value === 'sats') {
    return props.min
  }
  if (selectedCurrency.value === 'EUR' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    return formatNumber(props.min / rateBtcSats * props.rateBtcEur, 2, 2, undefined, 'en')
  }
  return props.min / rateBtcSats
})

const inputMax = computed(() => {
  if (props.max == null) {
    return undefined
  }
  if (selectedCurrency.value === 'sats') {
    return props.max
  }
  if (selectedCurrency.value === 'EUR' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    return formatNumber(props.max / rateBtcSats * props.rateBtcEur, 2, 2, undefined, 'en')
  }
  return props.max / rateBtcSats
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
  min: {
    type: Number,
    default: 0,
  },
  max: {
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
  if (selectedCurrency.value === 'sats' && props.rateBtcEur != null && props.rateBtcEur > 0) {
    selectedCurrency.value = 'EUR'
    return
  }
  if (selectedCurrency.value === 'sats' || selectedCurrency.value === 'EUR') {
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
