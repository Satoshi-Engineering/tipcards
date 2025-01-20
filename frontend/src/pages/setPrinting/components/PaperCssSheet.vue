<template>
  <div
    class="sheet"
    :style="{ width: `${props.width}mm`, height: `${props.height}mm` }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
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

watch(() => props.width, () => {
  if (additionalStyleElement.value != null) {
    document.head.removeChild(additionalStyleElement.value)
  }
  additionalStyleElement.value = document.createElement('style')
  additionalStyleElement.value.textContent = `@media print { body { width: ${props.width}mm } }`
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
  margin: 0;
}

.sheet {
  overflow: hidden;
  position: relative;
  page-break-after: always;
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
