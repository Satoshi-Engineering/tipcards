<template>
  <div class="border flex flex-col">
    <div
      class="p-2 flex-1"
      :class="{
        'bg-green-light text-green': !loading && color === 'green',
        'bg-yellow-light text-yellow': !loading && color === 'yellow',
        'bg-blue-light text-blue': !loading && color === 'blue',
      }"
    >
      <strong
        class="text-4xl"
        :class="{ 'opacity-0': loading }"
      >{{ cardsCount }}</strong>
      <div
        class="text-sm text-black uppercase"
        :class="{ 'opacity-0': loading }"
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
    type: String as PropType<'green' | 'yellow' | 'blue'>,
    default: 'green',
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
