<template>
  <TheLayout
    :locales="locales"
    :current-locale="currentLocale"
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

        <div class="text-center">
          <ButtonDefault @click="onDummyClick">
            Primary Button
          </ButtonDefault>
        </div>

        <HeadlineDefault level="h3">
          Multi line
        </HeadlineDefault>
        <div class="flex flex-col">
          <ButtonDefault @click="onDummyClick">
            This is a very long text in this button, why would you do that?
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            @click="onDummyClick"
          >
            This is a very long secondary text in this button, why would you do that?
          </ButtonDefault>
        </div>

        <HeadlineDefault level="h3">
          Loading
        </HeadlineDefault>
        <div class="flex flex-col">
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
        </div>

        <HeadlineDefault level="h3">
          Disabled
        </HeadlineDefault>
        <div class="flex flex-col">
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
        </div>

        <HeadlineDefault level="h3">
          As Router Links
        </HeadlineDefault>
        <div class="flex flex-col">
          <ButtonDefault :to="dummyLink">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            :to="dummyLink"
          >
            Secondary Button
          </ButtonDefault>
        </div>

        <HeadlineDefault level="h3">
          As Hrefs
        </HeadlineDefault>
        <div class="flex flex-col">
          <ButtonDefault href="https://satoshiengineering.com/">
            Primary Button
          </ButtonDefault>
          <ButtonDefault
            variant="secondary"
            href="https://satoshiengineering.com/"
          >
            Secondary Button
          </ButtonDefault>
        </div>
      </CenterContainer>
    </section>
  </TheLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { LOCALES, useI18nHelpers } from '@/modules/initI18n'

import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

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

const { currentLocale } = useI18nHelpers()
const locales = ref(Object.entries(LOCALES).map(([code, { name }]) => ({ code, name })))
</script>
