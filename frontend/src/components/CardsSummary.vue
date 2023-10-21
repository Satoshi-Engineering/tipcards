<template>
  <div class="border flex flex-col">
    <div class="p-2 flex-1">
      <strong class="text-4xl">{{ cardsCount }}</strong>
      <div
        v-if="color === 'btcorange'"
        class="text-sm text-btcorange uppercase"
      >
        {{ title }}
      </div>
      <div
        v-else-if="color === 'lightningpurple'"
        class="text-sm text-lightningpurple uppercase"
      >
        {{ title }}
      </div>
    </div>
    <div class="border-t p-2">
      <strong>{{ sats }}</strong> sats
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

defineProps({
  color: {
    type: String as PropType<'btcorange' | 'lightningpurple'>,
    default: 'btcorange',
  },
  cardsCount: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  sats: {
    type: Number,
    default: 0,
  },
})
</script>
