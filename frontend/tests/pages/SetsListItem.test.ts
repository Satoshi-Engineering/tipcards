import '../mocks/i18n'
import '../mocks/router'
import '../mocks/pinia'
import '../mocks/modules/useTRpc'

import { mount, config, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SetsListItem from '@/pages/sets/components/SetsListItem.vue'
import { createSet } from '../data/set'
import type { SetStatisticsDto } from '@shared/data/trpc/tipcards/SetStatisticsDto'

describe('SetsListItem', () => {
  config.global.stubs.RouterLink = RouterLinkStub

  it('renders a set\'s list item with correct name, date and number of cards', async () => {
    const set = createSet({ created: new Date('2012-12-12T12:12:00'), settings: { name: 'set1', numberOfCards: 4 } })
    const wrapper = mount(SetsListItem, {
      props: { set },
    })

    expect(wrapper.find('[data-test="sets-list-item-name"]').text()).toBe(set.settings.name)
    expect(wrapper.find('[data-test="sets-list-item-date"]').text()).toBe('12/12/2012, 12:12 PM')
    expect(wrapper.findAll('[data-test="sets-list-item-statistics"] > div').length).toBe(set.settings.numberOfCards)
  })

  it('renders a maximum of 12 boxes for the statistics visualisation', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const wrapper = mount(SetsListItem, {
      props: { set },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics"] > div').length).toBe(12)
  })

  it('renders the absolute numbers of colorized statistics boxes for sets with <= 12 cards', async () => {
    const set = createSet({ settings: { numberOfCards: 10 } })
    const statistics: SetStatisticsDto = { withdrawn: 4, funded: 3, pending: 2, unfunded: 1 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(4)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(3)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(2)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(1)
  })

  it('renders the colorized statistics boxes by rounding up if the actual numberOfCards exceeds 12', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 35, funded: 25, pending: 4, unfunded: 36 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(5)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(3)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(3)
  })
})
