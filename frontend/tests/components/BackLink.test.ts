import { mount } from '@vue/test-utils'
import { describe, beforeEach, it, expect } from 'vitest'

import { mockRoute } from '../mocks/router'
import { t } from '../mocks/i18n'

import BackLink from '@/components/BackLink.vue'

beforeEach(() => {
  mockRoute.meta = {
    backlink: true,
  }
})

describe('BackLink', () => {
  it('renders a back link', async () => {
    const wrapper = mount(BackLink)
    const backlink = wrapper.getComponent(BackLink)
    expect(backlink.text()).toBe(t('general.back'))
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

  it('renders an empty back link', async () => {
    mockRoute.meta = {
      backlink: false,
    }
    const wrapper = mount(BackLink)
    const backlink = wrapper.getComponent(BackLink)
    expect(backlink.text()).toBe('')
    expect(true).toBe(true)
  })
})
