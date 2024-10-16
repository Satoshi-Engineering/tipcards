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

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(4)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(3)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(4)
  })

  it('renders the colorized statistics boxes correctly for 1 withdrawn and 99 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 99, pending: 0, unfunded: 0 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(11)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(0)
  })

  it('renders the colorized statistics boxes correctly for 1 unfunded and 99 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 0, funded: 99, pending: 0, unfunded: 1 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(11)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(1)
  })

  it('renders the colorized statistics boxes correctly for 1 unfunded, 1 withdrawn, and 98 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 98, pending: 0, unfunded: 1 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(10)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(1)
  })

  it('renders the colorized statistics boxes correctly for 1 unfunded, 1 withdrawn, 1 pending and 97 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 97, pending: 1, unfunded: 1 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(9)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(1)
  })

  it('renders the colorized statistics boxes correctly for 49 withdrawn and 51 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 49, funded: 51, pending: 0, unfunded: 0 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(6)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(6)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(0)
  })

  it('renders the colorized statistics boxes correctly for 1 withdrawn and 99 unfunded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 0, pending: 0, unfunded: 99 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(11)
  })

  it('renders the colorized statistics boxes correctly for 1 withdrawn and 7 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 8 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 7, pending: 0, unfunded: 0 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(7)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(0)
  })

  it('renders the colorized statistics boxes correctly for 13 unfunded, 1 withdrawn, 5 pending and 84 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const statistics: SetStatisticsDto = { withdrawn: 1, funded: 84, pending: 5, unfunded: 13 }
    const wrapper = mount(SetsListItem, {
      props: { set, statistics },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-statistics-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-funded"]').length).toBe(8)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-pending"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-statistics-unfunded"]').length).toBe(2)
  })
})
