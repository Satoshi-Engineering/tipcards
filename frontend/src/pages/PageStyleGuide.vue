<template>
  <TheLayout
    :faqs="[{
      question: 'What is the purpose of this page? (This is just for testing as I need a multi line question)',
      answer: 'To showcase the style guide of the Lightning TipCards.',
    }, {
      question: 'Why are these questions not localized?',
      answer: 'Because this is a style guide page and not a content page. What a dumb question ... 🤦',
    }, {
      question: 'Is this the real reason?',
      answer: 'No, the real reason is that I am lazy and I don\'t want to localize this page. (This answer was written by Github Copilot)',
    }]"
  >
    <CenterContainer class="mb-10">
      <HeadlineDefault level="h1">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h2">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h3">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <HeadlineDefault level="h4">
        Lightning TipCards Style Guide
      </HeadlineDefault>
      <ParagraphDefault>
        <LinkDefault href="https://www.lipsum.com/">Lorem Ipsum</LinkDefault> is simply dummy
        text of the printing and typesetting industry. Lorem Ipsum has been the industry's
        standard dummy text ever since the 1500s, when an unknown printer took a galley of type
        and scrambled it to make a type specimen book. It has survived not only five centuries,
        but also the leap into electronic typesetting, remaining
        <LinkDefault :to="dummyLink">essentially unchanged</LinkDefault>. It was popularised
        in the 1960s with the release of Letraset sheets containing
        <LinkDefault @click="onDummyClick">Lorem Ipsum</LinkDefault> passages, and more recently
        with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
      </ParagraphDefault>
      <ParagraphDefault class="text-yellow">
        <LinkDefault href="https://www.lipsum.com/">Lorem Ipsum</LinkDefault> in yellow is simply dummy text of the printing and typesetting industry.
      </ParagraphDefault>
    </CenterContainer>

    <section class="py-10 bg-grey-light">
      <CenterContainer>
        <HeadlineDefault level="h2">
          Buttons
        </HeadlineDefault>

        <ButtonGroup>
          <ButtonDefault @click="onDummyClick">
            Primary Button
          </ButtonDefault>
        </ButtonGroup>

        <HeadlineDefault level="h3">
          Multi line
        </HeadlineDefault>
        <ButtonGroup>
          <ButtonDefault @click="onDummyClick">
            This is a very long text in this button, why would you do that?
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            @click="onDummyClick"
          >
            This is a very long secondary text in this button, why would you do that?
          </ButtonDefault>
        </ButtonGroup>

        <HeadlineDefault level="h3">
          Loading
        </HeadlineDefault>
        <ButtonGroup>
          <ButtonDefault
            :loading="dummyLoading"
            @click="onDummyLoading"
          >
            Click Me To Load
          </ButtonDefault>
          <ButtonDefault
            loading
            @click="onDummyClick"
          >
            Infinite Loading
          </ButtonDefault>
        </ButtonGroup>

        <HeadlineDefault level="h3">
          Disabled
        </HeadlineDefault>
        <ButtonGroup>
          <ButtonDefault
            disabled
            @click="onDummyClick"
          >
            Disabled Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            disabled
            @click="onDummyClick"
          >
            Disabled Secondary Button
          </ButtonDefault>
        </ButtonGroup>

        <HeadlineDefault level="h3">
          As Router Links
        </HeadlineDefault>
        <ButtonGroup>
          <ButtonDefault :to="dummyLink">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            :to="dummyLink"
          >
            Secondary Button
          </ButtonDefault>
        </ButtonGroup>

        <HeadlineDefault level="h3">
          As Hrefs
        </HeadlineDefault>
        <ButtonGroup>
          <ButtonDefault href="https://satoshiengineering.com/">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            href="https://satoshiengineering.com/"
          >
            Secondary Button
          </ButtonDefault>
        </ButtonGroup>
      </CenterContainer>
    </section>
    <section class="py-10">
      <CenterContainer class="mb-10">
        <HeadlineDefault level="h2">
          Slider
        </HeadlineDefault>
        <SliderDefault v-slot="{ nextSlide, currentPosition }">
          <SlideDefault
            v-slot="{ active }"
            :active="currentPosition === 0"
            @next-slide="nextSlide"
          >
            <img src="https://placehold.co/800x400" alt="Placeholder">
            <ParagraphDefault class="p-4">
              <LinkDefault href="https://www.lipsum.com/" :tabindex="active ? 0 : -1">
                Lorem Ipsum
              </LinkDefault>
            </ParagraphDefault>
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
      </CenterContainer>

      <CenterContainer class="!max-w-3xl">
        <SliderDefault v-slot="{ nextSlide, currentPosition }">
          <SlideDefault
            v-slot="{ active }"
            :active="currentPosition === 0"
            @next-slide="nextSlide"
          >
            <img src="https://placehold.co/800x400" alt="Placeholder">
            <ParagraphDefault class="p-4">
              <LinkDefault href="https://www.lipsum.com/" :tabindex="active ? 0 : -1">
                Lorem Ipsum
              </LinkDefault>
            </ParagraphDefault>
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
      </CenterContainer>
    </section>
  </TheLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonGroup from '@/components/buttons/ButtonGroup.vue'
import SlideDefault from '@/components/slider/SlideDefault.vue'
import SliderDefault from '@/components/slider/SliderDefault.vue'

const dummyLink = {
  name: 'cards',
  params: { setId: 'style-guide-set' },
}

const onDummyClick = () => {
  alert('What\'s the purpose?')
}

const dummyLoading = ref(false)
const onDummyLoading = async () => {
  dummyLoading.value = true
  await new Promise((resolve) => setTimeout(resolve, 3000))
  dummyLoading.value = false
}

</script>
