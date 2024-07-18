<template>
  <TheLayout>
    <HeadlineDefault level="h1">
      Lightning Tip Cards Style Guide
    </HeadlineDefault>
    <HeadlineDefault level="h2">
      Lightning Tip Cards Style Guide
    </HeadlineDefault>
    <HeadlineDefault level="h3">
      Lightning Tip Cards Style Guide
    </HeadlineDefault>
    <HeadlineDefault level="h4">
      Lightning Tip Cards Style Guide
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

    <hr class="my-8">
    <HeadlineDefault level="h2">
      Buttons
    </HeadlineDefault>
    <ButtonDefault @click="onDummyClick">
      Primary Button
    </ButtonDefault>

    <HeadlineDefault level="h3">
      Multi line
    </HeadlineDefault>
    <div class="flex flex-col max-w-xs">
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
    <div class="flex flex-col max-w-xs">
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
    <div class="flex flex-col max-w-xs">
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
    <div class="flex flex-col max-w-xs">
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
    <div class="flex flex-col max-w-xs">
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
  </TheLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
</script>
