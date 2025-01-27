<template>
  <form @submit.prevent>
    <div class="text-sm mb-5">
      All sizes in mm.
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-x-5 lg:gap-1">
      <div>
        <strong>Card</strong>
        <div class="flex gap-3">
          <TextField
            v-model="printSettings.cardWidth"
            label="Width"
            type="number"
            min="0"
            :max="printSettings.pageWidth - printSettings.minPrintMarginHorizontal * 2"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.cardHeight"
            label="Height"
            type="number"
            min="0"
            :max="printSettings.pageHeight - printSettings.minPrintMarginVertical * 2"
            step="1"
            class="w-full !mb-2"
          />
        </div>
      </div>
      <div>
        <strong>Gap between cards</strong>
        <div class="flex gap-3">
          <TextField
            v-model="printSettings.cardGapHorizontal"
            label="Horizontal"
            type="number"
            min="0"
            :max="printSettings.pageWidth - printSettings.minPrintMarginHorizontal * 2"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.cardGapVertical"
            label="Vertical"
            type="number"
            min="0"
            :max="printSettings.pageHeight - printSettings.minPrintMarginVertical * 2"
            step="1"
            class="w-full !mb-2"
          />
        </div>
      </div>
      <div>
        <strong>Page</strong>
        <div class="flex gap-3">
          <TextField
            v-model="printSettings.pageWidth"
            label="Width"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.pageHeight"
            label="Height"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
        </div>
      </div>
      <div>
        <strong>Minimum print margins</strong>
        <div class="flex gap-3">
          <TextField
            v-model="printSettings.minPrintMarginHorizontal"
            label="Horizontal"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.minPrintMarginVertical"
            label="Vertical"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
        </div>
      </div>
      <div>
        <strong>Images</strong>
        <div class="flex flex-col gap-3 xs:flex-row lg:flex-col">
          <ImageDropZone
            v-model="printSettings.frontSideImage"
            label="Drop front side image here"
            class="w-full mb-2"
          />
          <ImageDropZone
            v-model="printSettings.backSideImage"
            label="Drop back side image here"
            class="w-full mb-2"
          />
        </div>
      </div>
      <div>
        <strong>QR code</strong>
        <div class="flex gap-3">
          <TextField
            v-model="printSettings.qrCodeSize"
            label="Size"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.qrCodeX"
            label="X"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
          <TextField
            v-model="printSettings.qrCodeY"
            label="Y"
            type="number"
            min="0"
            step="1"
            class="w-full !mb-2"
          />
        </div>
      </div>
      <div>
        <strong>Print settings</strong>
        <label class="flex gap-3">
          <input
            v-model="printSettings.printSetInfo"
            type="checkbox"
          >
          Print set ID and page number
        </label>
        <label class="flex gap-3">
          <input v-model="printSettings.printCropMarks" type="checkbox">
          Print crop marks
        </label>
        <label class="flex gap-3">
          <input v-model="printSettings.printBorders" type="checkbox">
          Print borders
        </label>
        <label class="flex gap-3">
          <input v-model="printSettings.printText" type="checkbox">
          Print text
        </label>
        <label class="flex gap-3">
          <input
            v-model="printSettings.doubleSidedPrinting"
            type="checkbox"
            @update:model-value="() => printSettings.backSidesOnly = false"
          >
          Double-sided printing
        </label>
        <label class="flex gap-3">
          <input
            v-model="printSettings.backSidesOnly"
            type="checkbox"
            @update:model-value="() => printSettings.doubleSidedPrinting = false"
          >
          Print back sides only
        </label>
      </div>
    </div>
    <div class="my-5">
      <strong>Presets</strong>
      <ul class="list-disc pl-5">
        <li v-for="(preset, index) in printSettingsPresets" :key="index">
          <LinkDefault
            type="button"
            no-bold
            @click="emitPrintSettings(preset)"
          >
            {{ preset.name }}
          </LinkDefault>
          <LinkDefault
            v-if="preset.link != null"
            no-bold
            invert-underline
            class="inline-block ms-3 text-sm"
            :href="preset.link"
            :title="preset.link"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-box-arrow-up-right"
              viewBox="0 0 16 16"
            >
              <path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5" />
              <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z" />
            </svg>
          </LinkDefault>
        </li>
      </ul>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, watch, type PropType } from 'vue'

import printSettingsPresets, { type PrintSettings } from '../printSettingsPresets'
import TextField from '@/components/forms/TextField.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ImageDropZone from './ImageDropZone.vue'

const props = defineProps({
  modelValue: {
    type: Object as PropType<PrintSettings>,
    required: true,
  },
})

const printSettings = reactive<PrintSettings>({ ...props.modelValue })

const emit = defineEmits(['update:modelValue'])

const emitPrintSettings = (settings: PrintSettings) => {
  emit('update:modelValue', { ...settings })
}

watch(() => props.modelValue, () => {
  Object.assign(printSettings, props.modelValue)
}, { deep: true })

watch(printSettings, () => {
  emitPrintSettings(printSettings)
}, { deep: true })

watch(() => printSettings.backSideImage, () => {
  if (printSettings.backSideImage != null && !printSettings.backSidesOnly) {
    emitPrintSettings({ ...printSettings, doubleSidedPrinting: true })
  }
})
</script>
