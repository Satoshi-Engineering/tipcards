<template>
  <div
    class="grid place-items-center fixed z-40 top-0 left-0 right-0 w-full h-full lg:p-4 overflow-x-hidden overflow-y-auto bg-grey bg-opacity-50"
    @click="onBackdropClick"
  >
    <div
      class="relative w-full h-full lg:max-w-xl bg-white lg:h-auto"
      @click.stop
    >
      <!-- Modal content -->
      <div class="appearance-none relative py-4">
        <CenterContainer
          v-if="showCloseButton"
        >
          <BackLink
            v-if="showCloseButton"
            class="!pb-2"
            @click="$emit('close')"
          >
            {{ closeButtonText || $t('general.back') }}
          </BackLink>
        </CenterContainer>
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

import BackLink from './BackLink.vue'
import CenterContainer from './layout/CenterContainer.vue'

const props = defineProps({
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  closeButtonText: {
    type: String,
    default: undefined,
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
