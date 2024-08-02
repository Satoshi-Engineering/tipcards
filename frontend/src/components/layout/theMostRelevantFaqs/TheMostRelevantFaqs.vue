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
          v-for="(faq, index) in faqs"
          :key="`mostRelevantFaqs-faq${index}`"
          :question="faq.question"
          :answer="faq.answer"
          :active="activeIndex.includes(index)"
          @click="onClick(index)"
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
import { useI18n } from 'vue-i18n'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import MostRelevantFaqsListItem from '@/components/layout/theMostRelevantFaqs/components/MostRelevantFaqsListItem.vue'
import QuestionMark from '@/components/icons/QuestionMark.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'

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
      question: t(`footer.mostRelevantFaqs.defaults.faq${startingIndex}.question`),
      answer: t(`footer.mostRelevantFaqs.defaults.faq${startingIndex}.answer`),
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
