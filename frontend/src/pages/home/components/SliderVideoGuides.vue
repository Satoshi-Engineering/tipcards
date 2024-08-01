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
            class="text-yellow h-8"
          />
          <HeadlineDefault level="h3" class="mt-0">
            {{ slide.headline() }}
          </HeadlineDefault>
        </header>
        <ParagraphDefault>
          {{ slide.text() }}
        </ParagraphDefault>
        <ButtonIcon
          :to="{ name: 'cards' }"
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
import IconRectanglesQuestionmark from '@/components/icons/IconRectanglesQuestionmark.vue'
import IconRectanglesPencil from '@/components/icons/IconRectanglesPencil.vue'
import imageCreate from '@/assets/images/create-tipcards.square.webp'
import imageUse from '@/assets/images/use-tipcards.square.webp'

const { t } = useI18n()

const slides = [
  {
    icon: IconRectanglesPencil,
    headline: () => t('home.videoGuides.create.headline'),
    text: () => t('home.videoGuides.create.text'),
    videoLink: () => t('home.videoGuides.create.link'),
    image: imageUse,
  },
  {
    icon: IconRectanglesQuestionmark,
    headline: () => t('home.videoGuides.use.headline'),
    text: () => t('home.videoGuides.use.text'),
    videoLink: () => t('home.videoGuides.use.link'),
    image: imageCreate,
  },
]
</script>
