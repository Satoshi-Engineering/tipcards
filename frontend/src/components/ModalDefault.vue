<template>
  <Teleport to="body">
    <dialog
      ref="dialog"
      class="
        w-full max-w-full sm:max-w-xl max-h-full sm:max-h-[calc(100dvh-32px)] h-full sm:h-fit bg-white
        backdrop:bg-opacity-50 backdrop:bg-grey backdrop:overflow-y-auto
      "
      data-test="modal"
      v-bind="$attrs"
      @click="onDialogClick"
    >
      <!-- Modal content -->
      <div class="py-4">
        <CenterContainer
          v-if="!noCloseButton"
        >
          <BackLink
            data-test="modal-close-button"
            autofocus
            class="!pb-2"
            @click="dialog?.close()"
          >
            {{ closeButtonText || $t('general.close') }}
          </BackLink>
        </CenterContainer>
        <CenterContainer data-test="modal-content">
          <slot name="default" />
        </CenterContainer>
      </div>
    </dialog>
  </Teleport>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeMount, onBeforeUnmount, ref } from 'vue'

import BackLink from './BackLink.vue'
import CenterContainer from './layout/CenterContainer.vue'

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
})

const emit = defineEmits(['close'])

const dialog = ref<HTMLDialogElement | null>(null)

const onCloseEvent = () => {
  emit('close')
}

const onDialogClick = (event: MouseEvent) => {
  if (props.noCloseOnBackdropClick) {
    return
  }
  if (event.target === dialog.value) {
    dialog.value?.close()
  }
}

onBeforeMount(async () => {
  await nextTick()
  dialog.value?.showModal()
  dialog.value?.addEventListener('close', onCloseEvent)
})
onBeforeUnmount(() => {
  dialog.value?.removeEventListener('close', onCloseEvent)
})
</script>
