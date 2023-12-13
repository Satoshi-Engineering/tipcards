<template>
  <div class="border flex flex-col">
    <div class="p-2 flex-1">
      <strong
        class="text-4xl"
        :class="{ 'opacity-0': loading }"
      >{{ cardsCount }}</strong>
      <div
        class="text-sm  uppercase"
        :class="{
          'opacity-0': loading,
          'text-btcorange': color === 'btcorange',
          'text-lightningpurple': color === 'lightningpurple',
        }"
      >
        {{ title }}
      </div>
    </div>
    <div class="border-t p-2">
      <span :class="{ 'opacity-0': loading }"><strong>{{ sats }}</strong> sats</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'

defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
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
