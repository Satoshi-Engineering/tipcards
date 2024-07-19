import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import TheLangNav from '@/components/layout/TheLangNav.vue'

describe('TheLangNav', () => {
  const activeLocalIndex = 1
  const locales = [
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
  ]

  it('renders TheLangNav', async () => {
    const wrapper = mount(TheLangNav, {
      props: {
        locales,
      },
      currentCode: locales[activeLocalIndex].code,
    })

    const items = wrapper.findAll('li')
    items.forEach((item, index) => {
      expect(item.text()).toBe(locales[index].name)
      // TODO: add active element
    })
  })
})
