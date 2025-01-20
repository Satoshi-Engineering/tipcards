<template>
  <div class="relative">
    <div class="absolute top-0 bottom-0 start-0 end-0">
      <slot />
    </div>

    <div
      v-if="$slots.default != null && borders"
      class="absolute top-0 bottom-0 start-0 end-0 border-[0.5px] border-black opacity-[0.07] pointer-events-none select-none"
      :class="{
        'border-l-0': !isInFirstColumn && cardGapHorizontal === 0,
        'border-t-0': !isInFirstRow && cardGapVertical === 0,
      }"
    />

    <div v-if="cropMarks && isInFirstRow && (isInFirstColumn || cardGapHorizontal !== 0)" class="absolute border-l-[0.5px] opacity-50 h-5 -top-7 start-0" />
    <div v-if="cropMarks && isInFirstRow" class="absolute border-l-[0.5px] opacity-50 h-5 -top-7 end-0" />

    <div v-if="cropMarks && isInLastRow && (isInFirstColumn || cardGapHorizontal !== 0)" class="absolute border-l-[0.5px] opacity-50 h-5 -bottom-7 start-0" />
    <div v-if="cropMarks && isInLastRow" class="absolute border-l-[0.5px] opacity-50 h-5 -bottom-7 end-0" />

    <div v-if="cropMarks && isInFirstColumn && (isInFirstRow || cardGapVertical !== 0)" class="absolute border-t-[0.5px] opacity-50 w-5 top-0 -start-7" />
    <div v-if="cropMarks && isInFirstColumn" class="absolute border-t-[0.5px] opacity-50 w-5 bottom-0 -start-7" />

    <div v-if="cropMarks && isInLastColumn && (isInFirstRow || cardGapVertical !== 0)" class="absolute border-t-[0.5px] opacity-50 w-5 top-0 -end-7" />
    <div v-if="cropMarks && isInLastColumn" class="absolute border-t-[0.5px] opacity-50 w-5 bottom-0 -end-7" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  cardsPerRow: {
    type: Number,
    required: true,
  },
  cardsPerPage: {
    type: Number,
    required: true,
  },
  cardGapHorizontal: {
    type: Number,
    required: true,
  },
  cardGapVertical: {
    type: Number,
    required: true,
  },
  indexOnPage: {
    type: Number,
    required: true,
  },
  isBackside: {
    type: Boolean,
    default: false,
  },
  cropMarks: {
    type: Boolean,
    default: false,
  },
  borders: {
    type: Boolean,
    default: false,
  },
})

const isInFirstRow = computed(() => props.indexOnPage < props.cardsPerRow)
const isInLastRow = computed(() => props.indexOnPage >= props.cardsPerPage - props.cardsPerRow)

const isInFirstColumn = computed(() => {
  const isInFirstColumn = props.indexOnPage % props.cardsPerRow === 0
  if (props.isBackside) {
    return !isInFirstColumn
  }
  return isInFirstColumn
})

const isInLastColumn = computed(() => {
  const isInLastColumn = props.indexOnPage % props.cardsPerRow === props.cardsPerRow - 1
  if (props.isBackside) {
    return !isInLastColumn
  }
  return isInLastColumn
})
</script>
