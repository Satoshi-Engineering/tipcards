<template>
  <svg
    viewBox="-30 -30 160 160"
  >
    <circle
      cx="50"
      cy="50"
      fill="none"
      class="stroke-current"
      stroke-width="8"
      r="35"
      stroke-dasharray="164.93361431346415 56.97787143782138"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        repeatCount="indefinite"
        dur="1s"
        values="0 50 50;360 50 50"
        keyTimes="0;1"
      />
    </circle>
  </svg>
</template>

<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'btcorange',
  },
})
</script>
