import { config, mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

import TheFooter from '@/components/layout/TheFooter.vue'
import IconLogoLinkedIn from '@/components/icons/IconLogoLinkedIn.vue'
import IconLogoX from '@/components/icons/IconLogoX.vue'
import IconLogoInstagram from '@/components/icons/IconLogoInstagram.vue'

describe('TheFooter', () => {
  it('renders the footer', async () => {
    const wrapper = mount(TheFooter)
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'about' }))
    expect(wrapper.find(`a[href="${config.global.provide.linkPrivacyPolicy}"`).exists()).toBe(true)
    expect(wrapper.find(`a[href="${config.global.provide.linkLegalNotice}"`).exists()).toBe(true)
    expect(wrapper.getComponent(IconLogoLinkedIn)).toBeDefined()
    expect(wrapper.getComponent(IconLogoX)).toBeDefined()
    expect(wrapper.getComponent(IconLogoInstagram)).toBeDefined()
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
    expect(() => wrapper.getComponent(IconLogoLinkedIn)).toThrowError()
    expect(() => wrapper.getComponent(IconLogoX)).toThrowError()
    expect(() => wrapper.getComponent(IconLogoInstagram)).toThrowError()
    expect(wrapper.text()).toContain('by Satoshi Engineering')
  })
})
