<template>
  <div class="shadow-default rounded-default">
    <button class="block w-full appearance-none text-start p-4" @click="isOpen = !isOpen">
      <HeadlineDefault :level="level">
        {{ title }}
      </HeadlineDefault>
    </button>
    <div v-show="isOpen" class="p-4 animate-fade-in-slow pt-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import HeadlineDefault, { type HeadlineLevel } from './typography/HeadlineDefault.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  level: {
    type: String as PropType<HeadlineLevel>,
    default: 'h3',
  },
})

const isOpen = ref(false)
</script>
