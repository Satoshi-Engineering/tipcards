<template>
  <CenterContainer
    class="relative flex flex-col"
    data-test="create-your-own-tip-card"
  >
    <HeadlineDefault level="h2">
      {{ $t('landing.sectionUse.createYourOwnTipCardsHeadline') }}
    </HeadlineDefault>
    <ParagraphDefault>
      {{ $t('landing.sectionUse.createYourOwnTipCardsText') }}
    </ParagraphDefault>
    <ButtonContainer class="mt-5">
      <ButtonDefault
        @click="$router.push({ name: 'home', params: { lang: $route.params.lang } })"
      >
        {{ $t('landing.sectionUse.createYourOwnTipCardsButton') }}
      </ButtonDefault>
    </ButtonContainer>
  </CenterContainer>
</template>

<script setup lang="ts">
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
