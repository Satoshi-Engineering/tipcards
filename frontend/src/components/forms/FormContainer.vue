<template>
  <div class="px-4 py-5 rounded-default shadow-default">
    <slot name="headline">
      <h4 class="font-bold font-lato mb-5">
        {{ headline }}
      </h4>
    </slot>
    <slot name="default" />
  </div>
</template>

<script setup lang="ts">
defineProps({
  headline: {
    type: String,
    required: true,
  },
})
</script>
