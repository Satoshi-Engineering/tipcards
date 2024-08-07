<template>
  <TheLayout hide-faqs>
    <HeroSection>
      <HeadlineDefault level="h1">
        {{ $t('faqs.title') }}
      </HeadlineDefault>
      <ParagraphDefault>
        {{ $t('faqs.intro') }}
      </ParagraphDefault>
    </HeroSection>
    <CenterContainer class="mb-10">
      <CollapsibleElement
        v-for="(faq, index) in faqs"
        :key="index"
        :title="$t(faq.questionKeypath)"
        level="h4"
        class="my-3"
        hover-press-effect
      >
        <ParagraphDefault>
          <FaqI18nT :keypath="faq.answerKeypath" />
        </ParagraphDefault>
      </CollapsibleElement>
    </CenterContainer>
  </TheLayout>
</template>

<script setup lang="ts">
import CollapsibleElement from '@/components/CollapsibleElement.vue'
import FaqI18nT from '@/components/FaqI18nT.vue'
import HeroSection from '@/components/HeroSection.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheLayout from '@/components/layout/TheLayout.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import { FAQS, type Faq } from '@/modules/faqs'

const faqs: Faq[] = [
  FAQS.support,
  FAQS.monitorCards,
  FAQS.getBackSats,
  FAQS.bulkFunding,
  FAQS.custodial,
  FAQS.lightningNode,
  FAQS.openSource,
  FAQS.localStorageSets,
]
</script>

