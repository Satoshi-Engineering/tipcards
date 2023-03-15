<template>
  <span class="inline-block">
    <template
      v-for="{ char, isLeadingZero }, index in annotatedValue"
      :key="index"
    >
      <span
        :class="{
          [leadingZerosClass]: isLeadingZero,
          'ml-1': (1 - index) % 3 === 0 && char !== decimalSeparator,
        }"
      >{{ char }}</span>
    </template>
  </span>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue'
import { useI18n, type NumberOptions } from 'vue-i18n'

const { n } = useI18n()

const props = defineProps({
  value: {
    type: Number,
    required: true,
  },
  format: {
    type: Object as PropType<NumberOptions>,
    default: undefined,
  },
  leadingZerosClass: {
    type: String,
    default: '',
  },
})

const valueLocalized = computed(() => n(props.value, { ...props.format, useGrouping: false }))

const decimalSeparator = computed(() => n(1.1).at(1))

const annotatedValue = computed(() => {
  let onlyZeros = true
  if (props.value >= 0.1) {
    onlyZeros = false
  }
  return [...valueLocalized.value].map((char) => {
    if (onlyZeros && (char === '0' || char === decimalSeparator.value)) {
      return { char, isLeadingZero: true }
    }
    onlyZeros = false
    return { char, isLeadingZero: false }
  })
})

</script>
