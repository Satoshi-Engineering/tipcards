<template>
  <CenterContainer
    class="relative flex flex-col text-center"
    data-test="greeting-preview"
  >
    <GreetingIcon />
    <HeadlineDefault level="h1" styling="h2">
      {{ $t('landing.introMessagePreview.headline') }}
    </HeadlineDefault>
    <ParagraphDefault>
      <I18nT keypath="landing.introMessagePreview.message">
        <template #exchange>
          <LinkDefault href="https://kraken.com/">Kraken</LinkDefault>
        </template>
        <template #atm>
          <LinkDefault href="https://kurant.net/">Kurant</LinkDefault>
        </template>
        <template #broker>
          <LinkDefault href="https://coinfinity.co/">Coinfinity</LinkDefault>
        </template>
      </I18nT>
    </ParagraphDefault>
  </CenterContainer>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
</script>
