<template>
  <SliderDefault v-slot="{ currentPosition }" class="text-center">
    <SlideDefault v-for="(slide, index) in slides" :key="index">
      <div class="max-w-xs mx-auto">
        <component
          :is="slide.icon"
          v-if="slide.icon"
          class="text-yellow mx-auto w-12 max-h-12"
        />
        <HeadlineDefault level="h3">
          {{ slide.headline() }}
        </HeadlineDefault>
        <ParagraphDefault>
          {{ slide.text() }}
        </ParagraphDefault>
      </div>
      <ButtonIcon
        :to="{ name: 'cards' }"
        class="absolute bottom-3 end-3"
        :tabindex="currentPosition === index ? 0 : -1"
      />
    </SlideDefault>
  </SliderDefault>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import SlideDefault from '@/components/slider/SlideDefault.vue'
import SliderDefault from '@/components/slider/SliderDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import IconRectanglesQuestionmark from '@/components/icons/IconRectanglesQuestionmark.vue'
import IconRectanglesPencil from '@/components/icons/IconRectanglesPencil.vue'


const { t } = useI18n()

const slides = [
  {
    icon: IconRectanglesQuestionmark,
    headline: () => t('home.videoGuides.use.headline'),
    text: () => t('home.videoGuides.use.text'),
    videoLink: () => t('home.videoGuides.use.link'),
  },
  {
    icon: IconRectanglesPencil,
    headline: () => t('home.videoGuides.create.headline'),
    text: () => t('home.videoGuides.create.text'),
    videoLink: () => t('home.videoGuides.create.link'),
  },
]
</script>
