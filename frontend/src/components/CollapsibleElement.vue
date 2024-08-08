<template>
  <div
    class="shadow-default rounded-default hover:shadow-default-flat transition-[padding-bottom]"
    :class="{
      'pb-5': isOpen,
      'hover:translate-y-0.5': hoverPressEffect,
    }"
  >
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
      class="px-5 animate-fade-in"
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
  hoverPressEffect: {
    type: Boolean,
    default: false,
  },
})

const isOpen = ref(false)
</script>
