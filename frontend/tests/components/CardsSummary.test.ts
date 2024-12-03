import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../mocks/router'
import { t } from '../mocks/i18n'

import CardsSummary from '@/components/cardsSummary/CardsSummary.vue'

describe('CardsSummary', () => {
  it('renders a cards summary', async () => {
    const wrapper = mount(CardsSummary, {
      props: {
        cardsSummaryWithLoadingStatus: {
          status: 'success',
          cardsSummary: {
            funded: {
              amount: 500,
              count: 5,
            },
            withdrawn: {
              amount: 200,
              count: 2,
            },
            unfunded: {
              amount: 0,
              count: 4,
            },
            userActionRequired: {
              amount: 0,
              count: 0,
            },
          },
        },
      },
    })

    const cardsSummary = wrapper.getComponent(CardsSummary)
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('200 sats')
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('2 cards')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('500 sats')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('5 cards')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('700 sats')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('11 cards')
  })

  it('renders the loading state', async () => {
    const wrapper = mount(CardsSummary, {
      props: {
        cardsSummaryWithLoadingStatus: {
          status: 'loading',
        },
      },
    })

    const cardsSummary = wrapper.getComponent(CardsSummary)
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain(t('cardsSummary.withdrawn'))
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('… cards')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain(t('cardsSummary.funded'))
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('… cards')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain(t('cardsSummary.total'))
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('… cards')
  })

  it('renders the preview state', async () => {
    const wrapper = mount(CardsSummary, {
      props: {
        cardsSummaryWithLoadingStatus: {
          status: 'notLoaded',
        },
        preview: true,
      },
    })

    const cardsSummary = wrapper.getComponent(CardsSummary)
    expect(cardsSummary.vm.$el.dataset.test).toContain('cards-summary-preview')
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('0 sats')
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('0 cards')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('0 sats')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('0 cards')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('0 sats')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('0 cards')
  })

  it('renders the error state', async () => {
    const wrapper = mount(CardsSummary, {
      props: {
        cardsSummaryWithLoadingStatus: {
          status: 'error',
        },
        userErrorMessages: ['An error occurred'],
      },
    })

    const cardsSummary = wrapper.getComponent(CardsSummary)
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain(t('cardsSummary.withdrawn'))
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-withdrawn]').text()).toContain('… cards')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain(t('cardsSummary.funded'))
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-funded]').text()).toContain('… cards')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain(t('cardsSummary.total'))
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('… sats')
    expect(cardsSummary.find('[data-test=cards-summary-total]').text()).toContain('… cards')
    expect(cardsSummary.find('[data-test=cards-summary-error-messages]').text()).toContain('An error occurred')
  })
})
