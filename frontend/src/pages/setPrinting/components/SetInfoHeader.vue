<template>
  <header
    class="absolute px-1 flex justify-between text-sm text-grey"
    :style="{ insetInline: `${paddingHorizontal}mm`, top: `max(${paddingVertical / 2 - 2}mm, 5mm)` }"
  >
    <div>
      Set-ID: {{ setId }}
    </div>
    <div class="text-right">
      {{ isBackSide ? 'Back side of page' : 'Page' }} {{ pageIndex + 1 }}/{{ totalPages }}
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps({
  isBackSide: {
    type: Boolean,
    default: false,
  },
  setId: {
    type: String,
    required: true,
  },
  pageIndex: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  paddingHorizontal: {
    type: Number,
    required: true,
  },
  paddingVertical: {
    type: Number,
    required: true,
  },
})
</script>
