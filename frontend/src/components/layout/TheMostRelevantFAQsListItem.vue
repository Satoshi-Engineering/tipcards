<template>
  <li
    class="
      flex flex-cols gap-4 items-start
      cursor-pointer
      transition-colors ease-in duration-50
    "
    :class="{
      'text-white': active,
      'text-white-50 hover:text-white': !active,
    }"
  >
    <span class="h-6 flex items-center">
      <IconCaretUp v-if="active" class="w-4" />
      <IconCaretDown v-else class="w-4" />
    </span>
    <div>
      <button class="appearance-none text-start">
        {{ question }}
      </button>
      <div
        class="
          overflow-hidden
          transition-[height,opacity] ease-in duration-200
        "
        :class="{
          'h-0 opacity-0': !active,
          'h-[calc-size(auto)] opacity-100': active,
        }"
        data-test="most-relevant-faq-answer"
      >
        <ParagraphDefault class="!mt-4">
          {{ answer }}
        </ParagraphDefault>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import IconCaretDown from '@/components/icons/IconCaretDown.vue'
import IconCaretUp from '@/components/icons/IconCaretUp.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

defineProps({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
})
</script>
