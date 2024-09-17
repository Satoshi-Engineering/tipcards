<template>
  <Teleport to="body">
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
import { onBeforeMount, onBeforeUnmount } from 'vue'

import BackLink from './BackLink.vue'
import CenterContainer from './layout/CenterContainer.vue'
import { usePageScroll } from '@/modules/usePageScroll'

const props = defineProps({
  noCloseButton: {
    type: Boolean,
    default: false,
  },
  closeButtonText: {
    type: String,
    default: undefined,
  },
  noCloseOnBackdropClick: {
    type: Boolean,
    default: false,
  },
  noCloseOnEsc: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const onBackdropClick = () => {
  if (props.noCloseOnBackdropClick) {
    return
  }
  emit('close')
}

/////
// close on escape
const onKeyDown = (event: KeyboardEvent) => {
  if (props.noCloseOnEsc || event.key !== 'Escape') {
    return
  }
  emit('close')
}

/////
// disable page scroll when modal is open
const { disablePageScroll, enablePageScroll } = usePageScroll()

onBeforeMount(() => {
  document.addEventListener('keydown', onKeyDown)
  disablePageScroll()
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
  enablePageScroll()
})
</script>
