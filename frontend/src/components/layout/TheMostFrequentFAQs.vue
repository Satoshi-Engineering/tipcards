<template>
  <section class="rounded-t-2xl bg-bluegrey">
    <CenterContainer class="relative flex flex-col py-7 border-b border-white">
      <QuestionMark class="absolute -top-11 end-0" />
      <HeadlineDefault level="h2" class="!text-white">
        {{ $t('footer.mostFrequentFAQs.title') }}
      </HeadlineDefault>
      <ParagraphDefault class="mb-8 text-white">
        {{ $t('footer.mostFrequentFAQs.subTitle') }}
      </ParagraphDefault>
      <ButtonDefault :to="{ name: 'home' }" reduced-animation>
        {{ $t('footer.mostFrequentFAQs.buttonToFAQs') }}
      </ButtonDefault>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import QuestionMark from '@/components/svgs/QuestionMark.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
</script>
