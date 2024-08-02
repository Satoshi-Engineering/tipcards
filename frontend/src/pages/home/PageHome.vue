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
        <ButtonDefault
          :to="{ name: 'cards', params: { lang: $route.params.lang } }"
          data-test="button-create"
        >
          {{ $t('home.buttonCreate') }}
        </ButtonDefault>
        <ButtonDefault
          :to="{ name: 'sets', params: { lang: $route.params.lang } }"
          variant="secondary"
          data-test="button-sets"
        >
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
    <section class="my-9">
      <CenterContainer>
        <HeadlineDefault level="blockquote" styling="h1">
          <I18nT keypath="home.quote">
            <template #em>
              <em class="not-italic text-yellow">{{ $t('home.quoteEm') }}</em>
            </template>
          </I18nT>
        </HeadlineDefault>
      </CenterContainer>
    </section>
    <section class="my-7">
      <CenterContainer>
        <HeadlineDefault level="h2" class="text-center mb-0">
          {{ $t('home.howItWorksHeadline') }}
        </HeadlineDefault>
        <SliderHowItWorks />
      </CenterContainer>
    </section>
    <section class="py-4 bg-gradient-to-b from-grey-light to-transparent">
      <CenterContainer>
        <HeadlineDefault level="h2" class="text-center">
          {{ $t('home.videoGuidesHeadline') }}
        </HeadlineDefault>
        <ParagraphDefault class="text-center">
          {{ $t('home.videoGuidesText') }}
        </ParagraphDefault>
        <SliderVideoGuides class="mt-1" />
      </CenterContainer>
    </section>
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
import SliderHowItWorks from '@/pages/home/components/SliderHowItWorks.vue'
import SliderVideoGuides from '@/pages/home/components/SliderVideoGuides.vue'
</script>
