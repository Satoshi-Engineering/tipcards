<template>
  <TheLayout
    :faqs="[FAQS.getBackSats, FAQS.bulkFunding, FAQS.support]"
  >
    <CenterContainer>
      <BackLink :to="{ name: 'style-guide', params: { lang: $route.params.lang }}">
        Style Guide
      </BackLink>
      <HeadlineDefault level="h1" class="mt-0">
        Components
      </HeadlineDefault>
    </CenterContainer>

    <section>
      <CenterContainer class="mb-10">
        <HeadlineDefault level="h2">
          Slider
        </HeadlineDefault>
        <SliderStyleGuide class="mb-10" :slides-without-image="0" />
        <HeadlineDefault level="h3">
          Without image
        </HeadlineDefault>
        <SliderStyleGuide :slides-with-image="0" />
      </CenterContainer>

      <CenterContainer>
        <HeadlineDefault level="h3">
          A wider slider
        </HeadlineDefault>
      </CenterContainer>
      <CenterContainer class="!max-w-3xl">
        <SliderStyleGuide
          :slides-with-image="6"
          :slides-without-image="6"
        />
      </CenterContainer>
    </section>

    <section class="mb-10 py-10 bg-grey-light">
      <CenterContainer class="mb-10 pb-6">
        <HeadlineDefault level="h2">
          LightningQrCode
        </HeadlineDefault>
        <LightningQrCode
          class="my-7"
          value="lnurl1dp68gurn8ghj7er9wch8g6tsvdshyern9e5k7tmpwp5j7mrww4exctm3wgkkxmmyv5khgetnwse6dyf9"
        />

        <HeadlineDefault level="h3" class="mt-6">
          With Headline
        </HeadlineDefault>
        <LightningQrCode
          class="my-7"
          headline="Fund the LnurlP"
          value="lnurl1dp68gurn8ghj7er9wch8g6tsvdshyern9e5k7tmpwp5j7mrww4exctm3wgkkxmmyv5khgetnwse6dyf9"
        />
      </CenterContainer>
    </section>

    <section>
      <HeroSection>
        <template #default>
          <HeadlineDefault level="h2">
            Hero Section
          </HeadlineDefault>
          <ParagraphDefault>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </ParagraphDefault>
        </template>
        <template #buttonContainer>
          <ButtonDefault>
            Button somewhere
          </ButtonDefault>
        </template>
        <template #image>
          <img
            src="https://placehold.co/800x600"
            alt="Placeholder"
            class="w-full h-full object-cover rounded-default"
          >
        </template>
      </HeroSection>
      <HeroSection>
        <template #default>
          <HeadlineDefault level="h2">
            Another Hero Section without an image
          </HeadlineDefault>
          <ParagraphDefault>
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </ParagraphDefault>
        </template>
        <template #buttonContainer>
          <ButtonDefault>
            Another Button
          </ButtonDefault>
        </template>
      </HeroSection>
    </section>
  </TheLayout>
</template>

<script setup lang="ts">
import CenterContainer from '@/components/layout/CenterContainer.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import BackLink from '@/components/BackLink.vue'
import HeroSection from '@/components/HeroSection.vue'
import LightningQrCode from '@/components/LightningQrCode.vue'
import SliderStyleGuide from '@/pages/styleGuide/components/SliderStyleGuide.vue'
import { FAQS } from '@/modules/faqs'
</script>
