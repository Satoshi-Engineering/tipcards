<template>
  <DefaultLayout hide-header>
    <div class="grid justify-items-center">
      <div class="max-w-3xl w-full px-4 py-4">
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
        <ParagraphDefault class="text-yellow font-bold">
          Some yellow text.
        </ParagraphDefault>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

import DefaultLayout from './layouts/DefaultLayout.vue'

const dummyLink = {
  name: 'cards',
  params: { setId: 'style-guide-set' },
}

const onDummyClick = () => {
  alert('What\'s the purpose of this link?')
}
</script>
