<template>
  <img :src="image" class="w-[90mm] h-[55mm]">
  <svg
    ref="outerSvg"
    xmlns="http://www.w3.org/2000/svg"
    width="90mm"
    height="55mm"
  >
    <foreignObject
      x="0"
      y="0"
      width="100%"
      height="100%"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        class="absolute top-0 left-0 bottom-0 right-0"
      >
        <div
          class="absolute top-7 bottom-7 left-3 w-auto h-auto aspect-square"
          :class="{ 'opacity-50 blur-sm': status === 'used' }"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            :viewBox="`0 0 256 256`"
            class="qr-code-svg"
            :class="{ 'qr-code-svg--used': status === 'used' }"
          >
            <!-- eslint-disable vue/no-v-html -->
            <g v-html="qrCodeSvg" />
            <!-- eslint-enable vue/no-v-html -->
            <IconBitcoin
              v-if="qrCodeLogo === 'bitcoin'"
              :width="0.26 * 256"
              :height="0.26 * 256"
              :x="0.37 * 256"
              :y="0.37 * 256"
            />
            <IconLightning
              v-if="qrCodeLogo === 'lightning'"
              :width="0.26 * 256"
              :height="0.26 * 256"
              :x="0.37 * 256"
              :y="0.37 * 256"
            />
          </svg>
        </div>
        <div
          class="absolute left-1/2 ml-2 mr-4 top-0 bottom-2 flex items-center"
          :class="{ 'opacity-50 blur-sm': status === 'used' }"
          :dir="textDirection"
        >
          <div>
            <HeadlineDefault
              v-if="headline != null && headline !== ''"
              level="h1"
              styling="h4"
              class="mb-1"
            >
              {{ headline }}
            </HeadlineDefault>
            <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
            <ParagraphDefault
              v-if="copytext != null && copytext !== ''"
              class="text-sm leading-tight"
              v-html="sanitizeI18n(copytext)"
            />
          <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
          </div>
        </div>
      </div>
    </foreignObject>
  </svg>
</template>

<script setup lang="ts">
import { type PropType, watch, ref } from 'vue'
import svgToPng from '@/modules/svgToPng'

import HeadlineDefault from './typography/HeadlineDefault.vue'
import ParagraphDefault from './typography/ParagraphDefault.vue'
import IconBitcoin from '@/components/icons/IconBitcoin.vue'
import IconLightning from '@/components/icons/IconLightning.vue'

import sanitizeI18n from '@/modules/sanitizeI18n'

const props = defineProps({
  qrCodeSvg: {
    type: String,
    required: true,
  },
  qrCodeLogo: {
    type: String,
    default: 'bitcoin',
  },
  status: {
    type: String as PropType<string | null>,
    default: null,
  },
  textDirection: {
    type: String,
    default: 'ltf',
  },
  headline: {
    type: String,
    default: undefined,
  },
  copytext: {
    type: String,
    default: undefined,
  },
})

const outerSvg = ref<SVGElement>()

const image = ref()

watch(
  [outerSvg, () => props],
  async () => {
    if (outerSvg.value == null) {
      image.value = ''
      return
    }
    const blob = await svgToPng({ width: 900, height: 550, svg: outerSvg.value.outerHTML })
    if (blob == null) {
      return
    }
    image.value = URL.createObjectURL(blob)
  },
  { immediate: true, deep: true },
)
</script>
