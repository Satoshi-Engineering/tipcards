import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ParagraphDefault from '@/components/typography/ParagraphDefault.vue'

describe('ParagraphDefault', () => {
  it('renders a paragraph', async () => {
    const wrapper = mount(ParagraphDefault, {
      slots: {
        default: 'This is Satoshi Engineering!',
      },
    })
    const link = wrapper.find('p')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('This is Satoshi Engineering!')
  })
})
