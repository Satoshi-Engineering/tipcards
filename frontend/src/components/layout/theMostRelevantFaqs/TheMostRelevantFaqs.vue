<template>
  <section class="mt-10 rounded-t-default bg-bluegrey" data-test="the-most-relevant-faqs">
    <CenterContainer class="relative flex flex-col py-7 border-b border-white">
      <IconQuestionmark class="absolute w-[103px] h-[172px] -top-11 end-0 text-[#E1E1E2] opacity-30" />
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
          :question="$t(faq.questionKeypath)"
          :active="activeIndex.includes(index)"
          @click="onClick(index)"
        >
          <template #answer>
            <FaqI18nT :keypath="faq.answerKeypath" :i18n-scope="i18nScope" />
          </template>
        </MostRelevantFaqsListItem>
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
import type { ComponentI18nScope } from 'vue-i18n'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'
import CenterContainer from '@/components/layout/CenterContainer.vue'
import MostRelevantFaqsListItem from '@/components/layout/theMostRelevantFaqs/components/MostRelevantFaqsListItem.vue'
import IconQuestionmark from '@/components/icons/IconQuestionmark.vue'
import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'
import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'
import ButtonContainer from '@/components/buttons/ButtonContainer.vue'
import FaqI18nT from '@/components/FaqI18nT.vue'
import { FAQS, type Faq } from '@/modules/faqs'

const props = defineProps({
  faqs: {
    type: Array as PropType<Faq[]>,
    default: undefined,
    validator: (value: Faq[]) => value.length <= 3,
  },
  i18nScope: {
    type: String as PropType<ComponentI18nScope>,
    default: 'parent',
  },
})

const defaultFaqs = [FAQS.support, FAQS.monitorCards, FAQS.getBackSats]

const faqs = computed(() => {
  const faqs = props.faqs || []
  let startingIndex = 0
  while (faqs.length < 3) {
    faqs.push(defaultFaqs[startingIndex])
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
