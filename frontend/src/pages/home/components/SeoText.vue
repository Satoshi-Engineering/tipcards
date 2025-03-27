<template>
  <CenterContainer>
    <HeadlineDefault level="h2">
      {{ $t('home.seoTextHeadline') }}
    </HeadlineDefault>
    <StyledHtml
      :text="$t('home.seoText')"
    />
  </CenterContainer>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import StyledHtml from '@/components/typography/StyledHtml.vue'
</script>
