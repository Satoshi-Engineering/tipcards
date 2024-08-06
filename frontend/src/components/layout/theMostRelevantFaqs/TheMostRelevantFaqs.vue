<template>
  <section class="mt-10 rounded-t-default bg-bluegrey" data-test="the-most-relevant-faqs">
    <CenterContainer class="relative flex flex-col py-7 border-b border-white">
      <QuestionMark class="absolute -top-11 end-0" />
      <HeadlineDefault level="h2" class="!text-white">
        {{ $t('footer.mostRelevantFaqs.title') }}
      </HeadlineDefault>
      <ParagraphDefault class="mb-8 text-white">
        {{ $t('footer.mostRelevantFaqs.subTitle') }}
      </ParagraphDefault>
      <ul class="mb-8 flex flex-col gap-4">
        <MostRelevantFaqsListItem
          key="mostRelevantFaqs-faq-support"
          :question="$t('faq.faqSupport.question')"
          :active="activeIndex.includes(0)"
          @click="onClick(0)"
        >
          <template #answer>
            <I18nT keypath="faq.faqSupport.answer">
              <template #email>
                <LinkDefault :href="`mailto:${SUPPORT_EMAIL}?subject=Lightning%20Tip%20Cards%20Feedback`">{{ SUPPORT_EMAIL }}</LinkDefault>
              </template>
            </I18nT>
          </template>
        </MostRelevantFaqsListItem>
        <MostRelevantFaqsListItem
          v-for="(faq, index) in faqs"
          :key="`mostRelevantFaqs-faq${index+1}`"
          :question="faq.question"
          :answer="faq.answer"
          :active="activeIndex.includes(index+1)"
          @click="onClick(index+1)"
        />
      </ul>
      <ButtonContainer>
        <ButtonDefault
          :to="{ name: 'faqs', params: { lang: $route.params.lang } }"
          reduced-animation
          data-test="link-faq"
        >
          {{ $t('footer.mostRelevantFaqs.buttonToFaqs') }}
        </ButtonDefault>
      </ButtonContainer>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { I18nT, useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import MostRelevantFaqsListItem from '@/components/layout/theMostRelevantFaqs/components/MostRelevantFaqsListItem.vue'
import QuestionMark from '@/components/icons/QuestionMark.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import { SUPPORT_EMAIL } from '@/constants'
import LinkDefault from '@/components/typography/LinkDefault.vue'

const { t } = useI18n()

const props = defineProps({
  faqs: {
    type: Array as PropType<{ question: string, answer: string }[]>,
    default: undefined,
    validator: (value: { question: string, answer: string }[]) => value.length <= 2,
  },
})

const defaultFaqs = ['faq1', 'faq2']

const faqs = computed(() => {
  const faqs = props.faqs || []
  let startingIndex = 0
  while (faqs.length < 2) {
    faqs.push({
      question: t(`faq.${defaultFaqs[startingIndex]}.question`),
      answer: t(`faq.${defaultFaqs[startingIndex]}.answer`),
    })
    startingIndex += 1
  }
  return faqs
})

const activeIndex = ref([0])
const onClick = (index: number) => {
  if (activeIndex.value.includes(index)) {
    activeIndex.value = activeIndex.value.filter((i) => i !== index)
  } else {
    activeIndex.value = [...activeIndex.value, index]
  }
}
</script>
