import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import { t } from '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

import TheMostRelevantFaqs from '@/components/layout/theMostRelevantFaqs/TheMostRelevantFaqs.vue'

describe('TheMostRelevantFaqs', () => {
  it('renders the most relevant faqs', async () => {
    const wrapper = mount(TheMostRelevantFaqs, {
      props: {
        faqs: [
          { questionKeypath: 'faqs.questions.getBackSats.question', answerKeypath: 'faqs.questions.getBackSats.answer' },
        ],
        i18nScope: 'global',
      },
    })
    expect(wrapper.text()).toContain(t('faqs.questions.getBackSats.question'))
    expect(wrapper.text()).toContain(t('faqs.questions.getBackSats.answer'))
  })

  it('show the second answer when question is clicked', async () => {
    const wrapper = mount(TheMostRelevantFaqs, {
      props: {
        faqs: [
          { questionKeypath: 'faqs.questions.getBackSats.question', answerKeypath: 'faqs.questions.getBackSats.answer' },
          { questionKeypath: 'faqs.questions.bulkFunding.question', answerKeypath: 'faqs.questions.bulkFunding.answer' },
        ],
        i18nScope: 'global',
      },
    })
    expect(wrapper.text()).toContain(t('faqs.questions.bulkFunding.question'))
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[0].classes()).not.toContain('h-0')
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[1].classes()).toContain('h-0')

    await wrapper.findAll('ul li button')[1].trigger('click')
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[0].classes()).not.toContain('h-0')
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[1].classes()).not.toContain('h-0')

    await wrapper.findAll('ul li button')[0].trigger('click')
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[0].classes()).toContain('h-0')
    expect(wrapper.findAll('[data-test="most-relevant-faq-answer"]')[1].classes()).not.toContain('h-0')
  })
})
