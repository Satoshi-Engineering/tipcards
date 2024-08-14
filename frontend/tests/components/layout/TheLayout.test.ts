import '../../mocks/i18n'
import '../../mocks/pinia'
import '../../mocks/provide'
import '../../mocks/router'

import { mount, config } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheLayout from '@/components/layout/TheLayout.vue'

const TheHeaderStub = { template: '<div />' }
const TheFooterStub = { template: '<div />' }
const TheMostRelevantFaqsStub = { template: '<div />' }
config.global.stubs.TheHeader = TheHeaderStub
config.global.stubs.TheFooter = TheFooterStub
config.global.stubs.TheMostRelevantFaqs = TheMostRelevantFaqsStub

describe('TheLayout', () => {
  it('renders the layout', async () => {
    const wrapper = mount(TheLayout, {
      slots: {
        default: 'Satoshi Engineering Layout Test',
      },
    })
    expect(wrapper.getComponent(TheHeaderStub)).toBeDefined()
    expect(wrapper.text()).toContain('Satoshi Engineering Layout Test')
    expect(wrapper.getComponent(TheMostRelevantFaqsStub)).toBeDefined()
    expect(wrapper.getComponent(TheFooterStub)).toBeDefined()
  })

  it('renders without header or footer', async () => {
    const wrapper = mount(TheLayout, {
      slots: {
        header: 'Custom Header',
        default: 'Satoshi Engineering Layout Test',
        footer: 'Custom Footer',
      },
    })
    expect(() => wrapper.getComponent(TheHeaderStub)).toThrowError()
    expect(wrapper.text()).toContain('Custom Header')
    expect(wrapper.text()).toContain('Satoshi Engineering Layout Test')
    expect(() => wrapper.getComponent(TheMostRelevantFaqsStub)).toThrowError()
    expect(() => wrapper.getComponent(TheFooterStub)).toThrowError()
    expect(wrapper.text()).toContain('Custom Footer')
  })

  it('renders without faqs', async () => {
    const wrapper = mount(TheLayout, {
      slots: {
        default: 'Satoshi Engineering Layout Test',
      },
      props: {
        hideFaqs: true,
      },
    })
    expect(wrapper.getComponent(TheHeaderStub)).toBeDefined()
    expect(wrapper.text()).toContain('Satoshi Engineering Layout Test')
    expect(() => wrapper.getComponent(TheMostRelevantFaqsStub)).toThrowError()
    expect(wrapper.getComponent(TheFooterStub)).toBeDefined()
  })
})
