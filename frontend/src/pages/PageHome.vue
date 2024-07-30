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
        <ButtonDefault :to="{ name: 'cards' }">
          {{ $t('home.buttonCreate') }}
        </ButtonDefault>
        <ButtonDefault :to="{ name: 'cards' }" variant="secondary">
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
        Es ist leicht, bei alten Gewohnheiten zu bleiben. Alte Muster aufzubrechen <em class="not-italic text-yellow">zahlt sich aber aus.</em>
      </HeadlineDefault>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import TheLayout from '@/components/layout/TheLayout.vue'
import HeroSection from '@/components/HeroSection.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'



</script>
