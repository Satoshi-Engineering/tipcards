<template>
  <div
    class="w-full mx-auto px-5 py-3 print:p-0"
    :class="{
      'max-w-xl print:max-w-none': !fullWidth,
      'max-w-screen-xl print:max-w-none': fullWidth,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps({
  fullWidth: {
    type: Boolean,
    default: false,
  },
})
</script>
