<template>
  <LinkDefault
    v-if="!recentlyCopied"
    class="inline-block"
    :class="{ 'animate-fade-in': !disabled }"
    :disabled="disabled"
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

const props = defineProps({
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
  error: {
    type: String,
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const recentlyCopied = ref<boolean>(false)

const copyToClipboard = async (text: string) => {
  if (props.error != null) {
    alert(props.error)
    return
  }
  if (!navigator.clipboard) {
    prompt('Clipboard API not available due to missing https.\nThis is the text you attempted to copy:', text)
    return
  }
  await navigator.clipboard.writeText(text)
  recentlyCopied.value = true
  await new Promise(resolve => setTimeout(resolve, 4000))
  recentlyCopied.value = false
}
</script>
