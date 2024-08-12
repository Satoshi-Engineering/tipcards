<template>
  <SliderDefault v-slot="{ currentPosition }">
    <SlideDefault
      v-for="index in slidesWithImage"
      :key="`slider-style-guide-slide-with-image-${index}`"
    >
      <template #image>
        <img src="https://placehold.co/800x400" alt="Placeholder">
        <ButtonIcon
          href="https://www.youtube.com/watch?v=Oq__BT6oVoM"
          variant="yellow"
          icon="play"
          class="absolute bottom-3 end-3"
          :tabindex="currentPosition === index - 1 ? 0 : -1"
        />
      </template>
      <template #default>
        <HeadlineDefault level="h3">
          <IconTipCardsQuestionmark class="inline w-10 -mt-1 me-3 text-yellow" /> Use TipCards
        </HeadlineDefault>
        <ParagraphDefault class="mb-8">
          Slide {{ index }}<br>
          This is a typoblind text for this video slider that briefly describes what the video is about.
        </ParagraphDefault>
        <ButtonIcon
          class="absolute bottom-3 end-3"
          :to="dummyLink"
          :tabindex="currentPosition === index - 1 ? 0 : -1"
        />
      </template>
    </SlideDefault>
    <SlideDefault
      v-for="index in slidesWithoutImage"
      :key="`slider-style-guide-slide-without-image-${index}`"
    >
      <IconTipCardsPlus class="text-yellow w-10 h-auto" />
      <HeadlineDefault level="h3">
        Create a TipCard Set
      </HeadlineDefault>
      <ParagraphDefault class="mb-8">
        Slide {{ index }}<br>
        This is a typoblind text for this video slider that briefly describes what the video is about.
      </ParagraphDefault>
      <ButtonIcon
        class="absolute bottom-3 end-3"
        :to="dummyLink"
        :tabindex="currentPosition === index - 1 + slidesWithImage ? 0 : -1"
      />
    </SlideDefault>
  </SliderDefault>
</template>

<script setup lang="ts">
import { useRoute, type RouteLocationRaw } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import SlideDefault from '@/components/slider/SlideDefault.vue'
import SliderDefault from '@/components/slider/SliderDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'
import IconTipCardsPlus from '@/components/icons/IconTipCardsPlus.vue'
import IconTipCardsQuestionmark from '@/components/icons/IconTipCardsQuestionmark.vue'

defineProps({
  slidesWithImage: {
    type: Number,
    default: 3,
  },
  slidesWithoutImage: {
    type: Number,
    default: 3,
  },
})

const route = useRoute()

const dummyLink: RouteLocationRaw = {
  name: 'cards',
  params: { setId: 'style-guide-set', lang: route.params.lang },
}
</script>
