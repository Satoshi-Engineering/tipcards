<template>
  <li
    class="
      flex flex-cols gap-4 items-start
      transition-colors ease-in duration-50
    "
    :class="{
      'text-white': active,
      'text-white-50 hover:text-white': !active,
    }"
  >
    <span
      class="h-6 flex items-center cursor-pointer"
      @click="$emit('click')"
    >
      <IconCaretUp v-if="active" class="w-4" />
      <IconCaretDown v-else class="w-4" />
    </span>
    <div>
      <HeadlineDefault level="h3" styling="none">
        <button
          class="appearance-none text-start"
          @click="$emit('click')"
        >
          {{ question }}
        </button>
      </HeadlineDefault>
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
          <slot name="answer">
            {{ answer }}
          </slot>
        </ParagraphDefault>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { onMounted, useSlots } from 'vue'

import IconCaretDown from '@/components/icons/IconCaretDown.vue'
import IconCaretUp from '@/components/icons/IconCaretUp.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

const slots = useSlots()

const props = defineProps({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    default: undefined,
  },
  active: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['click'])

onMounted(() => {
  if (slots.answer == null && props.answer == null) {
    console.warn('MostRelevantFaqsListItem: No "answer" provided!')
  }
})
</script>
