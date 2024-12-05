<template>
  <TheLayout>
    <CenterContainer>
      <HeadlineDefault level="h1">
        404
      </HeadlineDefault>
      <HeadlineDefault level="h2">
        {{ $t('notFound.subtitle') }}
      </HeadlineDefault>
      <ParagraphDefault>
        {{ $t('notFound.description') }}
      </ParagraphDefault>
      <ParagraphDefault>
        <BackLink to="/">
          {{ $t('notFound.backToHome') }}
        </BackLink>
      </ParagraphDefault>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import BackLink from '@/components/BackLink.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
