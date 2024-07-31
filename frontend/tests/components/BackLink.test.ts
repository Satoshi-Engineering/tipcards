import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../mocks/router'
import { t } from '../mocks/i18n'

import BackLink from '@/components/BackLink.vue'

describe('BackLink', () => {
  it('renders a back link', async () => {
    const wrapper = mount(BackLink, {
      props: {
        to: { name: 'home' },
      },
    })
    const backlink = wrapper.getComponent(BackLink)
    expect(backlink.text()).toBe(t('general.back'))

    const link = wrapper.find('a')
    expect(link.getComponent(RouterLinkStub).vm.to).toEqual({ name: 'home' })
    expect(link.exists()).toBe(true)
  })

  it('renders a back link with custom text', async () => {
    const customText = 'Custom Text'
    const wrapper = mount(BackLink, {
      slots: {
        default: customText,
      },
    })
    const backlink = wrapper.getComponent(BackLink)
    expect(backlink.text()).toBe(customText)
    expect(true).toBe(true)
  })
})
