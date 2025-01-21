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
    is-backside
  >
    <template v-if="indexOnPage != null" #default>
      <div class="w-full h-full grid place-items-center relative overflow-hidden">
        <img
          v-if="backSideImage"
          :src="backSideImage"
          class="absolute w-full h-full object-contain object-center"
        >
        <IconLogo
          v-else
          class="w-2/5 h-2/5"
        />
      </div>
    </template>
  </SetPrintingCard>
</template>

<script setup lang="ts">
import IconLogo from '@/components/icons/IconLogo.vue'
import SetPrintingCard from './SetPrintingCard.vue'

defineProps({
  width: {
    type: Number,
    required: true,
  },
  height: {
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
  cardGapHorizontal: {
    type: Number,
    required: true,
  },
  cardGapVertical: {
    type: Number,
    required: true,
  },
  indexOnPage: {
    type: Number,
    required: true,
  },
  backSideImage: {
    type: String,
    default: '',
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
