import '../mocks/i18n'
import '../mocks/intersectionObserver'
import '../mocks/router'

import SetsList from '@/components/setsList/SetsList.vue'
import { mount } from '@vue/test-utils'
import { createSet } from '../data/set'
import { describe, it, expect } from 'vitest'

describe('SetsList', () => {
  it('renders a list of sets', async () => {
    const sets = Array.from({ length: 2 }, () => (createSet()))

    const wrapper = mount(SetsList, {
      props: {
        sets,
      },
    })

    expect(wrapper.find('[data-test="sets-list"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="sets-list-item"]').length).toBe(2)
  })

  it('sorts the sets descending by changed date', async () => {
    const sets = [
      createSet({ changed: new Date('2021-01-01') }),
      createSet({ changed: new Date('2021-01-02') }),
    ]

    const wrapper = mount(SetsList, {
      props: {
        sets,
      },
    })

    const items = wrapper.findAll('[data-test="sets-list-item"]')
    expect(items.at(0)?.text()).toContain('01/02/2021')
    expect(items.at(1)?.text()).toContain('01/01/2021')
  })

  it('sorts the sets descending alphabetically date', async () => {
    const sets = [
      createSet({ settings: { name: 'B' } }),
      createSet({ settings: { name: 'A' } }),
    ]

    const wrapper = mount(SetsList, {
      props: {
        sets,
        sorting: 'name',
      },
    })

    const items = wrapper.findAll('[data-test="sets-list-item"]')
    expect(items.at(0)?.text()).toContain('A')
    expect(items.at(1)?.text()).toContain('B')
  })
})
