import '../../mocks/i18n'
import '../../mocks/pinia'
import '../../mocks/router'

import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../../mocks/router'
import '../../mocks/i18n'

import TheHeader from '@/components/layout/TheHeader.vue'
import TheMainNav from '@/components/layout/theMainNav/TheMainNav.vue'
import TheLangNav from '@/components/layout/TheLangNav.vue'
import IconWorld from '@/components/icons/IconWorld.vue'
import IconX from '@/components/icons/IconX.vue'
import IconMainNav from '@/components/icons/IconMainNav.vue'

describe('TheHeader', () => {
  it('renders the header', async () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'home' }))
    expect(wrapper.findComponent(TheMainNav).exists()).toBe(false)
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

  it('click on the WorldIcon should toggle TheLangNav and X should close it again', async () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.getComponent(IconWorld)).toBeDefined()
    expect(wrapper.getComponent(IconMainNav)).toBeDefined()
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)

    const langNavOpenButton = wrapper.getComponent(IconWorld)
    await langNavOpenButton.trigger('click')
    expect(wrapper.findComponent(IconWorld).exists()).toBe(false)
    expect(wrapper.findComponent(IconMainNav).exists()).toBe(false)
    expect(wrapper.getComponent(TheLangNav)).toBeDefined()

    const langNavCloseButton = wrapper.getComponent(IconX)
    await langNavCloseButton.trigger('click')
    expect(wrapper.getComponent(IconWorld)).toBeDefined()
    expect(wrapper.getComponent(IconMainNav)).toBeDefined()
    expect(wrapper.findComponent(TheLangNav).exists()).toBe(false)
  })

  it('Mouse over on lang icon, main icon and close icon should color icon yellow', async () => {
    const wrapper = mount(TheHeader)
    wrapper.findAll('button').forEach(async (button) => {
      expect(button.classes()).not.toContain('text-yellow')
      await button.trigger('mouseover')
      expect(button.classes()).toContain('hover:text-yellow')
    })

    wrapper.get('button').trigger('click')
    wrapper.findAll('button').forEach(async (button) => {
      expect(button.classes()).not.toContain('text-yellow')
      await button.trigger('mouseover')
      expect(button.classes()).toContain('hover:text-yellow')
    })
  })

  it('click on the Main nav button should toggle TheMainNav and X should close it again', async () => {
    const wrapper = mount(TheHeader)
    expect(wrapper.getComponent(IconWorld)).toBeDefined()
    expect(wrapper.getComponent(IconMainNav)).toBeDefined()
    expect(wrapper.findComponent(TheMainNav).exists()).toBe(false)

    const mainNavOpenButton = wrapper.getComponent(IconMainNav)
    await mainNavOpenButton.trigger('click')
    expect(wrapper.findComponent(IconWorld).exists()).toBe(false)
    expect(wrapper.findComponent(IconMainNav).exists()).toBe(false)
    expect(wrapper.getComponent(TheMainNav)).toBeDefined()

    const langNavCloseButton = wrapper.getComponent(IconX)
    await langNavCloseButton.trigger('click')
    expect(wrapper.getComponent(IconWorld)).toBeDefined()
    expect(wrapper.getComponent(IconMainNav)).toBeDefined()
    expect(wrapper.findComponent(TheMainNav).exists()).toBe(false)
  })
})
