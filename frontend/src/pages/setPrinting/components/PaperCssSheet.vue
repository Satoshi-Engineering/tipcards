<template>
  <div
    class="sheet"
    :style="{ width: `${props.width}mm`, height: `${props.height}mm` }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watchEffect } from 'vue'
const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
})

const additionalStyleElement = ref<HTMLStyleElement>()

watchEffect(() => {
  if (additionalStyleElement.value != null) {
    document.head.removeChild(additionalStyleElement.value)
  }
  const sizeA4fix = props.width === 210 && props.height >= 296 && props.height <= 297 ? 'size: A4 portrait;' : ''
  additionalStyleElement.value = document.createElement('style')
  additionalStyleElement.value.innerHTML = `@media print {
    body { width: ${props.width}mm; }
    @page { width: ${props.width}mm; height: ${props.height}mm; ${sizeA4fix} }
  }`
  document.head.appendChild(additionalStyleElement.value)
})

onUnmounted(() => {
  if (additionalStyleElement.value == null) {
    return
  }
  document.head.removeChild(additionalStyleElement.value)
})
</script>

<style>
@page {
  margin: 0 !important;
  box-sizing: border-box;
}

.sheet {
  overflow: hidden;
  position: relative;
  break-inside: avoid;
  break-after: page;
  box-sizing: border-box;
}

@media screen {
  .sheet {
    background: white;
    box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
    margin-bottom: 5mm;
  }
}

@media print {
  .sheet {
    margin: 0 !important;
    box-shadow: none;
  }
}
</style>
