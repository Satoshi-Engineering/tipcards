<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    style="shape-rendering: auto;"
    class="block m-auto"
    :class="`text-${color}`"
    width="50px"
    height="50px"
    viewBox="0 0 100 100"
    preserveAspectRatio="xMidYMid"
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
