<template>
  <LinkDefault
    :to="to"
    rel="alternate"
    class="flex items-center gap-4 py-3 pl-4 text-lg font-semibold hover:underline"
    active-class="font-bold text-yellow hover:no-underline"
    invert-underline
    @click="$emit('itemSelected')"
  >
    <div class="grid w-5 h-5 mt-0.75 place-items-center text-xl">
      <slot />
    </div>
    <div class="flex-1">
      {{ label }}
    </div>
  </LinkDefault>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

import LinkDefault from '@/components/typography/LinkDefault.vue'

defineProps({
  to: {
    type: [String, Object] as PropType<RouteLocationRaw>,
    default: undefined,
  },
  label: {
    type: String,
    required: true,
  },
})

defineEmits(['itemSelected'])
</script>
