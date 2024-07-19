import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'

import '../../mocks/router'

describe('TheHeader', () => {
  it('renders the header', async () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'home' }))
    expect(wrapper.getComponent(TheMainNav)).toBeDefined()
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)
  })

  it('keeps the language in the home link', async () => {
    const wrapper = mount(TheHeader, {
      global: {
        mocks: {
          $route: {
            params: {
              lang: 'en',
            },
          },
        },
      },
    })
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({
      name: 'home',
      params: {
        lang: 'en',
      },
    }))
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)
  })
})
