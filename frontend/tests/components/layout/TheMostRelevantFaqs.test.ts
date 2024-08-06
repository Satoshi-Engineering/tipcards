import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

import TheMostRelevantFaqs from '@/components/layout/theMostRelevantFaqs/TheMostRelevantFaqs.vue'

describe('TheMostRelevantFaqs', () => {
  it('renders the most relevant faqs', async () => {
    const wrapper = mount(TheMostRelevantFaqs, {
      props: {
        faqs: [
          { question: 'What is the meaning of life?', answer: '42' },
        ],
      },
    })
    expect(wrapper.text()).toContain('What is the meaning of life?')
    expect(wrapper.text()).toContain('42')
  })

  it('show the second answer when question is clicked', async () => {
    const wrapper = mount(TheMostRelevantFaqs, {
      props: {
        faqs: [
          { question: 'What is the meaning of life?', answer: '42' },
          { question: 'Another question', answer: 'Another answer' },
        ],
      },
    })
    expect(wrapper.text()).toContain('Another question')
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
