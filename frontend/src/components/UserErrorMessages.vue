<template>
  <div v-if="userErrorMessages.length > 0">
    <ParagraphDefault
      v-for="message in userErrorMessages"
      :key="message"
      class="text-red-500"
      dir="ltr"
    >
      {{ message }}
    </ParagraphDefault>
  </div>
</template>

<script setup lang="ts">
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

defineProps({
  userErrorMessages: {
    type: Array<string>,
    required: true,
  },
})
</script>
