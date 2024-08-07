<template>
  <div class="shadow-default rounded-default">
    <button
      class="flex w-full items-center gap-3 appearance-none text-start py-4 px-5"
      data-test="collapsible-element-title"
      @click="isOpen = !isOpen"
    >
      <HeadlineDefault class="flex-1 mb-0" :level="level">
        {{ title }}
      </HeadlineDefault>
      <IconCaretDown v-if="!isOpen" class="w-5 h-5" />
      <IconCaretUp v-else class="w-5 h-5" />
    </button>
    <div
      v-show="isOpen"
      class="p-5 animate-fade-in pt-0"
      data-test="collapsible-element-content"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from 'vue'
import HeadlineDefault, { type HeadlineLevel } from './typography/HeadlineDefault.vue'
import IconCaretDown from './icons/IconCaretDown.vue'
import IconCaretUp from './icons/IconCaretUp.vue'

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
