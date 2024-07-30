<template>
  <TheLayout>
    <HeroSection>
      <template #default>
        <HeadlineDefault level="h1">
          {{ $t('home.headline') }}
        </HeadlineDefault>
        <ParagraphDefault>
          {{ $t('home.intro') }}
        </ParagraphDefault>
      </template>
      <template #buttonContainer>
        <ButtonDefault :to="{ name: 'cards' }" data-test="button-create">
          {{ $t('home.buttonCreate') }}
        </ButtonDefault>
        <ButtonDefault :to="{ name: 'sets' }" variant="secondary">
          {{ $t('home.buttonSets') }}
        </ButtonDefault>
      </template>
      <template #image>
        <img
          src="@/assets/images/hero-image.webp"
          alt="Hero image"
          class="rounded-default object-cover w-full max-h-72"
        >
      </template>
    </HeroSection>
    <CenterContainer>
      <HeadlineDefault level="h3" styling="h1">
        <I18nT keypath="home.quote">
          <template #em>
            <em class="not-italic text-yellow">{{ $t('home.quoteEm') }}</em>
          </template>
        </I18nT>
      </HeadlineDefault>
    </CenterContainer>
    <CenterContainer>
      <HeadlineDefault level="h2">
        {{ $t('home.howItWorksHeadline') }}
      </HeadlineDefault>
      <SliderHowItWorks />
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import { I18nT } from 'vue-i18n'

import TheLayout from '@/components/layout/TheLayout.vue'
import HeroSection from '@/components/HeroSection.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import SliderHowItWorks from './home/SliderHowItWorks.vue'



</script>
