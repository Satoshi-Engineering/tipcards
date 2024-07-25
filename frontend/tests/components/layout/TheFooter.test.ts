import { config, mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheFooter from '@/components/layout/TheFooter.vue'
import IconLinkedIn from '@/components/icons/IconLinkedIn.vue'
import IconX from '@/components/icons/IconX.vue'
import IconInstagram from '@/components/icons/IconInstagram.vue'

import '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

describe('TheFooter', () => {
  it('renders the footer', async () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'about' }))
    expect(wrapper.find(`a[href="${config.global.provide.linkPrivacyPolicy}"`).exists()).toBe(true)
    expect(wrapper.find(`a[href="${config.global.provide.linkLegalNotice}"`).exists()).toBe(true)
    expect(wrapper.getComponent(IconLinkedIn)).toBeDefined()
    expect(wrapper.getComponent(IconX)).toBeDefined()
    expect(wrapper.getComponent(IconInstagram)).toBeDefined()
    expect(wrapper.text()).toContain('by Satoshi Engineering')
  })

  it('renders a footer w/o social links', async () => {
    const wrapper = mount(TheFooter, {
      global: {
        provide: {
          linkPrivacyPolicy: undefined,
          linkLegalNotice: undefined,
          linkLinkedIn: undefined,
          linkX: undefined,
          linkInstagram: undefined,
        },
      },
    })
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'about' }))
    expect(wrapper.find(`a[href="${config.global.provide.linkPrivacyPolicy}"`).exists()).toBe(false)
    expect(wrapper.find(`a[href="${config.global.provide.linkLegalNotice}"`).exists()).toBe(false)
    expect(() => wrapper.getComponent(IconLinkedIn)).toThrowError()
    expect(() => wrapper.getComponent(IconX)).toThrowError()
    expect(() => wrapper.getComponent(IconInstagram)).toThrowError()
    expect(wrapper.text()).toContain('by Satoshi Engineering')
  })
})
