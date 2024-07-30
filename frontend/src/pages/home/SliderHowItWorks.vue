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
          {{ slide.headline }}
        </HeadlineDefault>
        <ParagraphDefault>
          {{ slide.text }}
        </ParagraphDefault>
      </div>
      <ButtonIcon
        :to="{ name: 'cards' }"
        class="absolute bottom-3 end-3"
        :tabindex="currentPosition === index - 1 ? 0 : -1"
      />
    </SlideDefault>
  </SliderDefault>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import SlideDefault from '@/components/slider/SlideDefault.vue'
import SliderDefault from '@/components/slider/SliderDefault.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import IconRectanglesPlus from '@/components/icons/IconRectanglesPlus.vue'
import IconPrinter from '@/components/icons/IconPrinter.vue'
import IconRectanglesArrowUp from '@/components/icons/IconRectanglesArrowUp.vue'
import IconLightningBolt from '@/components/icons/IconLightningBolt.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'


const { t } = useI18n()

const slides = ref([
  {
    icon: IconRectanglesPlus,
    headline: t('home.howItWorksSlides.create.headline'),
    text: t('home.howItWorksSlides.create.text'),
  },
  {
    icon: IconPrinter,
    headline: t('home.howItWorksSlides.print.headline'),
    text: t('home.howItWorksSlides.print.text'),
  },
  {
    icon: IconRectanglesArrowUp,
    headline: t('home.howItWorksSlides.fund.headline'),
    text: t('home.howItWorksSlides.fund.text'),
  },
  {
    icon: IconLightningBolt,
    headline: t('home.howItWorksSlides.give.headline'),
    text: t('home.howItWorksSlides.give.text'),
  },
])
</script>
