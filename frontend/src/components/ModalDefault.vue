<template>
  <div
    class="flex justify-center items-center fixed top-0 left-0 right-0 w-full h-full p-4 overflow-x-hidden overflow-y-auto bg-grey bg-opacity-50"
    @click="onBackdropClick"
  >
    <div
      class="relative w-full h-full max-w-2xl md:h-auto"
      @click.stop
    >
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow p-4">
        <div class="flex items-start justify-between mb-4">
          <slot name="headline">
            <HeadlineDefault level="h3">
              {{ headline }}
            </HeadlineDefault>
          </slot>
          <button
            v-if="showCloseButton"
            type="button"
            class="text-grey bg-transparent hover:bg-grey-light hover:text-grey-dark rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            @click="$emit('close')"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <slot name="default" />
        <div v-if="$slots.footer != null" class="flex items-start mt-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount } from 'vue'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

const props = defineProps({
  headline: {
    type: String,
    default: 'Headline Modal',
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  closeOnBackdropClick: {
    type: Boolean,
    default: true,
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const onBackdropClick = () => {
  if (!props.closeOnBackdropClick) {
    return
  }
  emit('close')
}

/////
// close on escape
const onKeyDown = (event: KeyboardEvent) => {
  if (props.closeOnEsc && event.key === 'Escape') {
    emit('close')
  }
}
onBeforeMount(() => {
  document.addEventListener('keydown', onKeyDown)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>
