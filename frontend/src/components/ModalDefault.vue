<template>
  <Teleport v-if="open" to="body">
    <div
      class="grid place-items-center fixed z-40 top-0 left-0 right-0 w-full h-full lg:p-4 overflow-x-hidden overflow-y-auto bg-grey bg-opacity-50"
      v-bind="$attrs"
      @click="onBackdropClick"
    >
      <div
        class="relative w-full h-full lg:max-w-xl bg-white lg:h-auto"
        @click.stop
      >
        <!-- Modal content -->
        <div class="appearance-none relative py-4">
          <CenterContainer
            v-if="!noCloseButton"
          >
            <BackLink
              class="!pb-2"
              @click="$emit('close')"
            >
              {{ closeButtonText || $t('general.close') }}
            </BackLink>
          </CenterContainer>
          <CenterContainer>
            <slot name="default" />
          </CenterContainer>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { onBeforeMount, onBeforeUnmount, watch } from 'vue'

import BackLink from './BackLink.vue'
import CenterContainer from './layout/CenterContainer.vue'
import { usePageScroll } from '@/modules/usePageScroll'

const props = defineProps({
  open: {
    type: Boolean,
    required: true,
  },
  noCloseButton: {
    type: Boolean,
    default: false,
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

/////
// disable page scroll when modal is open
const { disablePageScroll, enablePageScroll } = usePageScroll()
watch(() => props.open, (value) => {
  if (value) {
    disablePageScroll()
  } else {
    enablePageScroll()
  }
})
</script>
