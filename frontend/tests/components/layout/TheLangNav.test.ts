import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheLangNav from '@/components/layout/TheLangNav.vue'

import '../../mocks/router'

describe('TheLangNav', () => {
  const activeLocalIndex = 2
  const locales = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'de', name: 'German' },
  ]

  it('Renders TheLangNav', async () => {
    const wrapper = mount(TheLangNav, {
      props: {
        locales,
        currentLocale: locales[activeLocalIndex].code,
      },
    })

    const items = wrapper.findAll('li')
    items.forEach((item, index) => {
      expect(item.text()).toBe(locales[index].name)
      if (index === activeLocalIndex) {
        expect(item.classes()).toContain('font-bold')
        expect(item.classes()).toContain('text-yellow')
      } else {
        expect(item.classes()).not.toContain('font-bold')
        expect(item.classes()).not.toContain('text-yellow')
      }
    })
  })

  it('emits the itemSelected event on lang nav item click', async () => {
    const wrapper = mount(TheLangNav, {
      props: {
        locales,
        currentLocale: locales[activeLocalIndex].code,
      },
    })

    const routerLinks = wrapper.findAll('li > a')
    expect(wrapper.emitted('itemSelected')).toBeFalsy()
    await routerLinks[routerLinks.length - 1].trigger('click')
    expect(wrapper.emitted('itemSelected')).toBeTruthy()
  })

  it('check if lang nav items have underline on hover', async () => {
    const wrapper = mount(TheLangNav, {
      props: {
        locales,
        currentLocale: locales[activeLocalIndex].code,
      },
    })

    const routerLinks = wrapper.findAll('li > a')
    routerLinks.forEach(async (routerLink) => {
      expect(routerLink.classes()).not.toContain('underline')
      expect(routerLink.classes()).toContain('hover:underline')
    })
  })
})
