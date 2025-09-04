<template>
  <div
    ref="dropZoneRef"
    tabindex="0"
    class="border border-black border-dotted p-8 text-center cursor-pointer"
    :class="{
      'bg-gray-200': isOverDropZone,
      'bg-green-200': modelValue != null,
    }"
    @click="openFileDialog()"
    @keyup.enter="openFileDialog()"
    @keyup.space="openFileDialog()"
  >
    {{ label }}
    <br>
    <LinkDefault
      variant="secondary"
      :disabled="modelValue == null"
      @click.stop="clear"
    >
      Clear image
    </LinkDefault>
  </div>
</template>

<script setup lang="ts">
import { watch, useTemplateRef } from 'vue'
import { useDropZone, useFileDialog } from '@vueuse/core'
import LinkDefault from '@/components/typography/LinkDefault.vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Drop image here',
  },
  modelValue: {
    type: [String, null],
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

watch(() => props.modelValue, () => {
  if (props.modelValue == null) {
    reset()
  }
})

const onFile = (files: File[] | null) => {
  if (files == null || files.length === 0) {
    return
  }
  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target == null || typeof event.target.result !== 'string') {
      return
    }
    emit('update:modelValue', event.target.result)
  }
  reader.readAsDataURL(files[0])
}

const { onChange, open: openFileDialog, reset } = useFileDialog({
  accept: 'image/*', // Set to accept only image files
  directory: false, // Select directories instead of files if set true
  multiple: false, // Select multiple files if set true
})
onChange((files) => files != null && onFile([...Array.from(files)]))

const dropZoneRef = useTemplateRef('dropZoneRef')
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: onFile,
  // specify the types of data to be received.
  dataTypes: ['image/svg', 'image/png', 'image/jpeg', 'image/gif', 'image/webp'],
  // control multi-file drop
  multiple: false,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: true,
})

const clear = () => {
  reset()
  emit('update:modelValue', undefined)
}
</script>
