import '../../mocks/i18n'
import '../../mocks/router'
import '../../mocks/pinia'
import '../../mocks/intersectionObserver'
import '../../mocks/modules/useTRpc'

import { mount, config, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import SetsListItem from '@/pages/sets/components/SetsListItem.vue'
import { createSet } from '../../data/set'
import type { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto'
import { nextTick, ref } from 'vue'

describe('SetsListItem', () => {
  config.global.stubs.RouterLink = RouterLinkStub

  it('renders a set\'s list item with correct name, date and number of cards', async () => {
    const set = createSet({ created: new Date('2011-11-11T11:11:00'), changed: new Date('2012-12-12T12:12:00'), settings: { name: 'set1', numberOfCards: 4 } })
    const wrapper = mount(SetsListItem, {
      props: { set },
    })

    expect(wrapper.find('[data-test="sets-list-item-name"]').text()).toBe(set.settings.name)
    expect(wrapper.find('[data-test="sets-list-item-date"]').text()).toBe('12/12/2012, 12:12 PM')
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary"] > div').length).toBe(set.settings.numberOfCards)
  })

  it('renders a maximum of 12 boxes for the cardsSummary visualisation', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const wrapper = mount(SetsListItem, {
      props: { set },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary"] > div').length).toBe(12)
  })

  it('renders the absolute numbers of colorized cardsSummary boxes for sets with <= 12 cards', async () => {
    const set = createSet({ settings: { numberOfCards: 10 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 4, funded: 3, userActionRequired: 2, unfunded: 1 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(4)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(3)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(2)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(1)
  })

  it('renders the colorized cardsSummary boxes by rounding up if the actual numberOfCards exceeds 12', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 35, funded: 25, userActionRequired: 4, unfunded: 36 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(4)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(3)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(4)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 withdrawn and 99 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 99, userActionRequired: 0, unfunded: 0 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(11)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(0)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 unfunded and 99 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 0, funded: 99, userActionRequired: 0, unfunded: 1 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(11)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(1)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 unfunded, 1 withdrawn, and 98 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 98, userActionRequired: 0, unfunded: 1 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(10)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(1)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 unfunded, 1 withdrawn, 1 userActionRequired and 97 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 97, userActionRequired: 1, unfunded: 1 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(9)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(1)
  })

  it('renders the colorized cardsSummary boxes correctly for 49 withdrawn and 51 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 49, funded: 51, userActionRequired: 0, unfunded: 0 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(6)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(6)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(0)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 withdrawn and 99 unfunded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 0, userActionRequired: 0, unfunded: 99 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(11)
  })

  it('renders the colorized cardsSummary boxes correctly for 1 withdrawn and 7 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 8 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 7, userActionRequired: 0, unfunded: 0 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(7)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(0)
  })

  it('renders the colorized cardsSummary boxes correctly for 13 unfunded, 1 withdrawn, 5 userActionRequired and 84 funded cards', async () => {
    const set = createSet({ settings: { numberOfCards: 100 } })
    const cardsSummary: CardsSummaryDto = generateCardsSummary({ withdrawn: 1, funded: 84 , userActionRequired: 5, unfunded: 13 })
    const wrapper = mount(SetsListItem, {
      props: { set, cardsSummaryWithLoadingStatus: { cardsSummary: cardsSummary, status: 'success' } },
    })

    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-withdrawn"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-funded"]').length).toBe(8)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-userActionRequired"]').length).toBe(1)
    expect(wrapper.findAll('[data-test="sets-list-item-cards-summary-unfunded"]').length).toBe(2)
  })

  it('should update the infos if they are changed after rendering', async () => {
    const set = ref(createSet({ settings: { name: 'Old name', numberOfCards: 10 } }))
    const wrapper = mount(SetsListItem, {
      props: { set: set.value },
    })

    set.value.settings.name = 'New Name'
    set.value.settings.numberOfCards = 5

    await nextTick()

    expect(wrapper.find('[data-test="sets-list-item-name"]').text()).toBe('New Name')
    expect(wrapper.find('[data-test="sets-list-item-number-of-cards"]').text()).toBe('5 cards')
  })
})

const generateCardsSummary = (
  { withdrawn, funded, userActionRequired, unfunded }: { withdrawn: number, funded: number, userActionRequired: number, unfunded: number },
): CardsSummaryDto => {
  return {
    withdrawn: { count: withdrawn, amount: 210 * withdrawn },
    funded: { count: funded, amount: 210 * funded },
    userActionRequired: { count: userActionRequired, amount: 210 * userActionRequired },
    unfunded: { count: unfunded, amount: 210 * unfunded },
  }
}
