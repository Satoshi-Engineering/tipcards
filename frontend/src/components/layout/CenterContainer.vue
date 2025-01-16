<template>
  <div
    class="w-full mx-auto px-5 py-3"
    :class="{
      'max-w-xl': !fullWidth,
      'max-w-screen-2xl': fullWidth,
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
