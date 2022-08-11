<template>
  <LinkDefault
    v-if="!recentlyCopied"
    class="inline-block animate-fade-in"
    @click="copyToClipboard(text)"
  >
    <slot>
      {{ label }}
    </slot>
  </LinkDefault>
  <strong
    v-else
    class="inline-block animate-fade-out-slow [animation-delay:3000ms] pointer-events-none select-none"
  >
    <slot name="success">
      {{ labelSuccess }}
    </slot>
  </strong>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'

defineProps({
  text: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: 'Copy to clipboard',
  },
  labelSuccess: {
    type: String,
    default: 'Copied successfully',
  },
})

const recentlyCopied = ref<boolean>(false)

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text)
  recentlyCopied.value = true
  await new Promise(resolve => setTimeout(resolve, 4000))
  recentlyCopied.value = false
}
</script>
