import { config, mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheFooter from '@/components/layout/TheFooter.vue'
import TheHeader from '@/components/layout/TheHeader.vue'
import TheLayout from '@/components/layout/TheLayout.vue'

config.global.stubs = { RouterLink: RouterLinkStub }

describe('TheLayout', () => {
  it('renders the layout', async () => {
    const wrapper = mount(TheLayout, {
      slots: {
        default: 'Satoshi Engineering Layout Test',
      },
    })
    expect(wrapper.text()).toContain('Satoshi Engineering Layout Test')
    expect(wrapper.getComponent(TheHeader)).toBeDefined()
    expect(wrapper.getComponent(TheFooter)).toBeDefined()
  })

  it('renders without header or footer', async () => {
    const wrapper = mount(TheLayout, {
      slots: {
        header: 'Custom Header',
        default: 'Satoshi Engineering Layout Test',
        footer: 'Custom Footer',
      },
    })
    expect(() => wrapper.getComponent(TheHeader)).toThrowError()
    expect(wrapper.text()).toContain('Custom Header')
    expect(wrapper.text()).toContain('Satoshi Engineering Layout Test')
    expect(() => wrapper.getComponent(TheFooter)).toThrowError()
    expect(wrapper.text()).toContain('Custom Footer')
  })
})
