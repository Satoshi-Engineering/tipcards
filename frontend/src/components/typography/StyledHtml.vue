<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="styled-html" v-html="sanitizeI18n(text, ['p', 'ul', 'li'])" />
</template>

<script setup lang="ts">
import sanitizeI18n from '@/modules/sanitizeI18n'

defineProps({
  text: {
    type: String,
    required: true,
  },
  additionalAllowedTags: {
    type: Array,
    default: () => ['p', 'ul', 'li'],
  },
})
</script>

<style scoped>
.styled-html :deep(p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.styled-html :deep(p:first-child) {
  margin-top: 0;
}
.styled-html :deep(p:last-child) {
  margin-bottom: 0;
}
.styled-html :deep(ul) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  list-style-type: disc;
  padding-inline-start: 1.5rem;
}
</style>
