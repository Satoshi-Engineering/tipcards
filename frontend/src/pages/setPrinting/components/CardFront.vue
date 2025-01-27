<template>
  <SetPrintingCard
    :width="width"
    :height="height"
    :index-on-page="indexOnPage"
    :cards-per-row="cardsPerRow"
    :cards-per-page="cardsPerPage"
    :card-gap-horizontal="cardGapHorizontal"
    :card-gap-vertical="cardGapVertical"
    :borders="borders"
    :crop-marks="cropMarks"
  >
    <img
      v-if="frontSideImage"
      :src="frontSideImage"
      class="absolute w-full h-full object-contain object-center"
    >
    <SetPrintingQrCode
      class="absolute"
      :style="{ width: `${qrCodeSize}mm`, height: `${qrCodeSize}mm`, top: `${qrCodeY}mm`, insetInlineStart: `${qrCodeX}mm` }"
      :text="landingPageUrl"
      :selected-card-logo="selectedCardLogo"
    />
    <div
      v-if="showText"
      class="absolute top-0 bottom-0 mx-2.5 flex items-center"
      :style="{ insetInlineStart: `${qrCodeX + qrCodeSize}mm` }"
    >
      <article>
        <HeadlineDefault
          v-if="headline !== ''"
          level="h1"
          styling="h4"
          class="mb-1"
        >
          {{ headline }}
        </HeadlineDefault>
        <!-- eslint-disable vue/no-v-html vue/no-v-text-v-html-on-component -->
        <ParagraphDefault
          v-if="copytext !== ''"
          class="text-sm leading-tight"
          v-html="sanitizeI18n(copytext)"
        />
        <!-- eslint-enable vue/no-v-html vue/no-v-text-v-html-on-component -->
      </article>
    </div>
  </SetPrintingCard>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

import sanitizeI18n from '@/modules/sanitizeI18n'
import SetPrintingCard from './SetPrintingCard.vue'
import SetPrintingQrCode from './SetPrintingQrCode.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import type { SelectedCardLogo } from '@/modules/useCardLogos'

defineProps({
  landingPageUrl: {
    type: String,
    required: true,
  },
  indexOnPage: {
    type: Number,
    required: true,
  },
  cardsPerRow: {
    type: Number,
    required: true,
  },
  cardsPerPage: {
    type: Number,
    required: true,
  },
  headline: {
    type: String,
    default: '',
  },
  copytext: {
    type: String,
    default: '',
  },
  selectedCardLogo: {
    type: String as PropType<SelectedCardLogo>,
    required: true,
  },
  qrCodeSize: {
    type: Number,
    required: true,
  },
  qrCodeX: {
    type: Number,
    required: true,
  },
  qrCodeY: {
    type: Number,
    required: true,
  },
  frontSideImage: {
    type: [String, null],
    default: null,
  },
  showText: {
    type: Boolean,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  cardGapHorizontal: {
    type: Number,
    required: true,
  },
  cardGapVertical: {
    type: Number,
    required: true,
  },
  borders: {
    type: Boolean,
    required: true,
  },
  cropMarks: {
    type: Boolean,
    required: true,
  },
})
</script>
