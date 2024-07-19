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

  it('renders TheLangNav', async () => {
    const wrapper = mount(TheLangNav, {
      props: {
        locales,
      },
      currentLocale: locales[activeLocalIndex].code,
    })

    const items = wrapper.findAll('li')
    items.forEach((item, index) => {
      expect(item.text()).toBe(locales[index].name)
    })
  })
})
