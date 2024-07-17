import { mount } from '@vue/test-utils'
import { describe, test, expect } from 'vitest'

import HeadlineDefault from '@/components/typography/HeadlineDefault.vue'

describe('HeadlineDefault', () => {
  const headlines: ('h1' | 'h2' | 'h3' | 'h4')[] = ['h1', 'h2', 'h3', 'h4']

  test.each(headlines)('renders headline of specific level', async (level) => {
    const wrapper = mount(HeadlineDefault, {
      props: {
        level,
      },
      slots: {
        default: 'Satoshi Engineering Headline Test',
      },
    })
    const link = wrapper.find(level)
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Satoshi Engineering Headline Test')
  })

  test.each(headlines)('styling doesn\'t change tag', async (level) => {
    const wrapper = mount(HeadlineDefault, {
      props: {
        level,
        styling: 'h1',
      },
      slots: {
        default: 'Satoshi Engineering Headline Test',
      },
    })
    const link = wrapper.find(level)
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Satoshi Engineering Headline Test')
  })
})
