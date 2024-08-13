import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../mocks/router'
import '../mocks/i18n'
import '../mocks/constants'

import FaqI18nT from '@/components/FaqI18nT.vue'
import { LIGHTNING_NODE_NAME, LIGHTNING_NODE_LINK } from '@/constants'

describe('FaqI18nT', () => {
  it('renders a translated text and interpolates the lightningNode placeholder with the value from constants', async () => {
    const wrapper = mount(FaqI18nT, {
      props: {
        keypath: 'faqs.questions.lightningNode.answer',
        i18nScope: 'global',
      },
    })

    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe(LIGHTNING_NODE_NAME)
    expect(link.attributes().href).toBe(LIGHTNING_NODE_LINK)
  })
})
