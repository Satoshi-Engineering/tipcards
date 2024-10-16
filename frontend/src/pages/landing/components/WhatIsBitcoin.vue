<template>
  <CenterContainer data-test="what-is-bitcoin">
    <HeadlineDefault
      level="h2"
      class="mb-6"
    >
      {{ $t('landing.sectionBitcoin.headline') }}
    </HeadlineDefault>
    <IconLogoBitcoin class="w-16 mb-3 float-end ms-3" />
    <!-- eslint-disable vue/no-v-html, vue/no-v-text-v-html-on-component -->
    <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.0'))" />
    <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.1'))" />
    <ParagraphDefault v-html="sanitizeI18n($t('landing.sectionBitcoin.paragraphs.2'))" />
    <!-- eslint-enable vue/no-v-html, vue/no-v-text-v-html-on-component -->
  </CenterContainer>
</template>

<script setup lang="ts">
import IconLogoBitcoin from '@/components/icons/IconLogoBitcoin.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import sanitizeI18n from '@/modules/sanitizeI18n'
</script>
