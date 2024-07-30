import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../../mocks/router'
import '../../mocks/i18n'

import LOCALES from '@shared/modules/i18n/locales'

import TheLangNav from '@/components/layout/TheLangNav.vue'
import { useI18nHelpers } from '@/modules/initI18n'

describe('TheLangNav', () => {
  const { currentLocale } = useI18nHelpers()

  it('Renders TheLangNav', async () => {
    const wrapper = mount(TheLangNav)

    const items = wrapper.findAll('li a')
    items.forEach((item, index) => {
      const locale = {
        ...Object.values(LOCALES)[index],
        code: Object.keys(LOCALES)[index],
      }
      expect(item.text()).toBe(locale.name)
      if (locale.code === currentLocale.value) {
        expect(item.classes()).toContain('font-bold')
        expect(item.classes()).toContain('text-yellow')
      } else {
        expect(item.classes()).not.toContain('font-bold')
        expect(item.classes()).not.toContain('text-yellow')
      }
    })
  })

  it('emits the itemSelected event on lang nav item click', async () => {
    const wrapper = mount(TheLangNav)
    const routerLinks = wrapper.findAll('li > a')
    expect(wrapper.emitted('itemSelected')).toBeFalsy()
    await routerLinks[routerLinks.length - 1].trigger('click')
    expect(wrapper.emitted('itemSelected')).toBeTruthy()
  })

  it('check if lang nav items have underline on hover', async () => {
    const wrapper = mount(TheLangNav)
    const routerLinks = wrapper.findAll('li > a')
    routerLinks.forEach(async (routerLink) => {
      expect(routerLink.classes()).not.toContain('underline')
      expect(routerLink.classes()).toContain('hover:underline')
    })
  })

  it('switches the language', async () => {
    const wrapper = mount(TheLangNav)
    const routerLinks = wrapper.findAll('li > a')
    const localeCodes = Object.keys(LOCALES)
    expect(routerLinks[routerLinks.length - 1].getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({
      params: {
        lang: localeCodes[localeCodes.length - 1],
      },
    }))
  })
})
