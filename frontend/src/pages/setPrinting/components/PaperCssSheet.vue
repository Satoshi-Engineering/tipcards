<template>
  <div
    class="sheet"
    :style="{ width: `${props.width}mm`, height: `${props.height}mm` }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
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

onMounted(() => {
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
@page { margin: 0 }
.sheet {
  margin: 0;
  overflow: hidden;
  position: relative;
  page-break-after: always;
  box-sizing: border-box;
}

@media screen {
  .sheet {
    background: white;
    box-shadow: 0 .5mm 2mm rgba(0,0,0,.3);
    margin: 5mm auto;
  }
}
</style>
