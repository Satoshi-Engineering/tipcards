<template>
  <SliderDefault v-slot="{ currentPosition }" data-test="slider-video-guides">
    <SlideDefault v-for="(slide, index) in slides" :key="index">
      <template #image>
        <a
          :tabindex="currentPosition === index ? 0 : -1"
          :href="slide.videoLink()"
          target="_blank"
          rel="noopener noreferrer"
          class="block group"
          data-test="slider-video-link"
        >
          <img
            :src="slide.image"
            alt="Video guide"
            class="rounded-default object-cover w-full h-72"
          >
          <ButtonIcon
            element="span"
            class="absolute bottom-3 end-3"
            variant="yellow"
            icon="play"
            data-test="slider-video-button-play"
          />
        </a>
      </template>
      <article class="pb-6">
        <header class="flex items-center gap-3">
          <component
            :is="slide.icon"
            v-if="slide.icon"
            class="text-yellow h-8 w-auto"
          />
          <HeadlineDefault level="h3" class="mt-0">
            {{ slide.headline() }}
          </HeadlineDefault>
        </header>
        <ParagraphDefault>
          {{ slide.text() }}
        </ParagraphDefault>
        <ButtonIcon
          :to="{ name: 'cards', params: { lang: $route.params.lang } }"
          :tabindex="currentPosition === index ? 0 : -1"
          class="absolute bottom-3 end-3"
          data-test="slider-button-start"
        />
      </article>
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
import IconTipCardPencil from '@/components/icons/IconTipCardPencil.vue'
import IconTipCardsQuestionmark from '@/components/icons/IconTipCardsQuestionmark.vue'
import imageCreate from '@/assets/images/create-tipcards.square.webp'
import imageUse from '@/assets/images/use-tipcards.square.webp'

const { t } = useI18n()

const slides = [
  {
    icon: IconTipCardPencil,
    headline: () => t('home.videoGuidesSlides.create.headline'),
    text: () => t('home.videoGuidesSlides.create.text'),
    videoLink: () => t('home.videoGuidesSlides.create.link'),
    image: imageUse,
  },
  {
    icon: IconTipCardsQuestionmark,
    headline: () => t('home.videoGuidesSlides.use.headline'),
    text: () => t('home.videoGuidesSlides.use.text'),
    videoLink: () => t('home.videoGuidesSlides.use.link'),
    image: imageCreate,
  },
]
</script>
