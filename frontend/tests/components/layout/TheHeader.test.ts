import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'

import '../../mocks/router'

describe('TheHeader', () => {
  it('renders the header', async () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'home' }))
    expect(wrapper.getComponent(TheLangNav)).toBeDefined()
    expect(wrapper.getComponent(TheMainNav)).toBeDefined()
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
    expect(wrapper.getComponent(TheLangNav)).toBeDefined()
    expect(wrapper.getComponent(TheMainNav)).toBeDefined()
  })
})
