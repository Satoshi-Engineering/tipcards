<template>
  <section class="rounded-t-2xl bg-bluegrey" data-test="the-most-relevant-faqs">
    <CenterContainer class="relative flex flex-col py-7 border-b border-white">
      <QuestionMark class="absolute -top-11 end-0" />
      <HeadlineDefault level="h2" class="!text-white">
        {{ $t('footer.mostRelevantFAQs.title') }}
      </HeadlineDefault>
      <ParagraphDefault class="mb-8 text-white">
        {{ $t('footer.mostRelevantFAQs.subTitle') }}
      </ParagraphDefault>
      <ul class="mb-8 flex flex-col gap-4">
        <TheMostRelevantFAQsListItem
          v-for="(faq, index) in faqs"
          :key="`mostRelevantFAQs-faq${index}`"
          :question="faq.question"
          :answer="faq.answer"
          :active="activeIndex === index"
          @click="activeIndex = index"
        />
      </ul>
      <ButtonDefault
        :to="{ name: 'faqs' }"
        reduced-animation
        data-test="link-faq"
      >
        {{ $t('footer.mostRelevantFAQs.buttonToFAQs') }}
      </ButtonDefault>
    </CenterContainer>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, type PropType } from 'vue'
import { useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import TheMostRelevantFAQsListItem from '@/components/layout/TheMostRelevantFAQsListItem.vue'
import QuestionMark from '@/components/svgs/QuestionMark.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

const { t } = useI18n()

const props = defineProps({
  faqs: {
    type: Array as PropType<{ question: string, answer: string }[]>,
    default: undefined,
    validator: (value: { question: string, answer: string }[]) => value.length <= 3,
  },
})

const faqs = computed(() => {
  const faqs = props.faqs || []
  let startingIndex = 1
  while (faqs.length < 3) {
    faqs.push({
      question: t(`footer.mostRelevantFAQs.defaults.faq${startingIndex}.question`),
      answer: t(`footer.mostRelevantFAQs.defaults.faq${startingIndex}.answer`),
    })
    startingIndex += 1
  }
  return faqs
})

const activeIndex = ref(0)
</script>
