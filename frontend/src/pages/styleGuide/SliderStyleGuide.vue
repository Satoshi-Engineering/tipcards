<template>
  <SliderDefault v-slot="{ nextSlide, currentPosition }">
    <SlideDefault>
      <template #image>
        <img src="https://placehold.co/800x400" alt="Placeholder">
        <ButtonIcon
          href="https://www.youtube.com/watch?v=Oq__BT6oVoM"
          variant="yellow"
          icon="play"
          class="absolute bottom-3 end-3"
          :tabindex="currentPosition === 0 ? 0 : -1"
        />
      </template>
      <template #default>
        <HeadlineDefault level="h3">
          Create a TipCard Set
        </HeadlineDefault>
        <ParagraphDefault class="mb-8">
          This is a typoblind text for this video slider that briefly describes what the video is about.
        </ParagraphDefault>
        <ButtonIcon
          :to="dummyLink"
          class="absolute bottom-3 end-3"
          :tabindex="currentPosition === 0 ? 0 : -1"
        />
      </template>
    </SlideDefault>
    <SlideDefault :active="currentPosition === 1" @next-slide="nextSlide">
      <img src="https://placehold.co/800x400" alt="Placeholder">
    </SlideDefault>
    <SlideDefault :active="currentPosition === 2" @next-slide="nextSlide">
      <img src="https://placehold.co/800x400" alt="Placeholder">
      <ParagraphDefault>
        Have you ever heard of the term "Lorem Ipsum"?
      </ParagraphDefault>
    </SlideDefault>
  </SliderDefault>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import SlideDefault from '@/components/slider/SlideDefault.vue'
import SliderDefault from '@/components/slider/SliderDefault.vue'
import ButtonIcon from '@/components/buttons/ButtonIcon.vue'

const route = useRoute()

const dummyLink = {
  name: 'cards',
  params: { setId: 'style-guide-set', lang: route.params.lang },
}
</script>
