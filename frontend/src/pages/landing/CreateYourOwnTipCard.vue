<template>
  <CenterContainer class="relative mb-14 flex flex-col">
    <HeadlineDefault level="h2">
      {{ $t('landing.sectionUse.createYourOwnTipCardsHeadline') }}
    </HeadlineDefault>
    <ParagraphDefault>
      {{ $t('landing.sectionUse.createYourOwnTipCardsText') }}
    </ParagraphDefault>
    <ParagraphDefault class="text-center">
      <ButtonDefault
        @click="$router.push({ name: 'home', params: { lang: $route.params.lang } })"
      >
        {{ $t('landing.sectionUse.createYourOwnTipCardsButton') }}
      </ButtonDefault>
    </ParagraphDefault>
  </CenterContainer>
</template>

<script setup lang="ts">
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
