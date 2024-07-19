import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheMainNav from '@/components/layout/TheMainNav.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import IconWorld from '@/components/svgs/IconWorld.vue'
import IconClose from '@/components/svgs/IconClose.vue'

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

  it('click on the WorldIcon should toggle TheLangNav (Menu)', async () => {
    const wrapper = mount(TheHeader)
    const langNavOpenButton = wrapper.getComponent(IconWorld)
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)
    await langNavOpenButton.trigger('click')
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(true)
    const langNavCloseButton = wrapper.getComponent(IconClose)
    await langNavCloseButton.trigger('click')
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)
  })
})
