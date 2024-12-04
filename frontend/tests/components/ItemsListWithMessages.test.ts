import '../mocks/pinia'
import '../mocks/i18n'
import '../mocks/intersectionObserver'
import '../mocks/router'

import ItemsListWithMessages from '@/components/itemsList/ItemsListWithMessages.vue'
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

describe('ItemsListWithMessages', () => {
  const items = Array.from({ length: 4 }, (_, index) => ({ id: index, name: `Item ${index}` }))
  const slotTemplate = `
    <template #item="{ item }">
      <div data-test="items-list-item">{{ item.name }}</div>
    </template>`

  it('renders a list of items', async () => {

    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items,
        headerPrimary: 'Header primary',
        headerSecondary: 'Header secondary',
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="items-list-item"]').length).toBe(items.length)
  })

  it('renders the small loading spinner', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items,
        headerPrimary: 'Header primary',
        loading: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-loading-icon--small"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="items-list-loading-icon--large"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="items-list-reloading-icon"]').classes()).toContain('opacity-0')
  })

  it('renders the large loading spinner', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
        loading: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-loading-icon--small"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="items-list-loading-icon--large"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="items-list-reloading-icon"]').classes()).toContain('opacity-0')
  })

  it('renders the reloading spinner in the header', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items,
        headerPrimary: 'Header primary',
        headerSecondary: 'Header secondary',
        reloading: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-loading-icon--small"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="items-list-loading-icon--large"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="items-list-reloading-icon"]').classes()).toContain('opacity-100')
  })

  it('renders the error message', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
        userErrorMessages: ['Error message'],
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-message-error"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="items-list-message-error"]').text()).toContain('Error message')
  })

  it('renders the no items message', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-message-no-items"]').exists()).toBe(true)
  })

  it('does not render the no items message when loading', () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
        loading: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-message-no-items"]').exists()).toBe(false)
  })

  it('does not render the no items message when reloading', () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
        reloading: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-message-no-items"]').exists()).toBe(false)
  })

  it('renders the not logged in message', async () => {
    const wrapper = mount(ItemsListWithMessages, {
      props: {
        items: [],
        headerPrimary: 'Header primary',
        notLoggedIn: true,
      },
      slots: {
        default: slotTemplate,
      },
    })

    expect(wrapper.find('[data-test="items-list-message-not-logged-in"]').exists()).toBe(true)
  })
})
