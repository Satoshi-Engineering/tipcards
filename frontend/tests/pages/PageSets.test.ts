import '../mocks/i18n'
import '../mocks/router'
import '../mocks/pinia'

import { mount, config, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import PageSets from '@/pages/PageSets.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { useCardsSetsStore } from '@/stores/cardsSets'

import { createSet } from '../data/set'

config.global.stubs['the-layout'] = { template: '<slot />' }
config.global.stubs['user-error-messages'] = { template: '<div />' }

describe('PageSets', () => {
  const cardsStore = vi.mocked(useCardsSetsStore())
  const authStore = vi.mocked(useAuthStore())

  cardsStore.subscribe = vi.fn()

  it('should show a logged out sets page', async () => {
    authStore.isLoggedIn = false

    const wrapper = mount(PageSets)
    expect(wrapper.find('[data-test=headline]').exists()).toBe(true)
    const newSetButton = wrapper.find('[data-test=button-new-set]')
    expect(newSetButton.exists()).toBe(true)
    expect(newSetButton.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'cards' }))
    expect(wrapper.find('[data-test=please-login-section]').exists()).toBe(true)
    expect(wrapper.find('[data-test=logged-in]').exists()).toBe(false)
  })

  it('should show a logged in sets page', async () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    expect(wrapper.find('[data-test=please-login-section]').exists()).toBe(false)
    expect(wrapper.find('[data-test=logged-in]').exists()).toBe(true)
  })

  it('should show an empty sets page', () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    expect(wrapper.find('[data-test=sets-list-empty]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(false)
  })

  it('should show a list of named and nameless sets', () => {
    authStore.isLoggedIn = true
    cardsStore.sets = [
      createSet({ text: 'namedset1' }),
      createSet({ text: 'namedset2' }),
      createSet({ text: 'namedset3' }),
    ]

    const wrapper = mount(PageSets)
    expect(wrapper.find('[data-test=sets-list-empty]').exists()).toBe(false)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test=sets-list-with-data] li').length).toBe(cardsStore.sets.length)
    wrapper.findAll('[data-test=sets-list-with-data] li').forEach((li) => {
      const editSetButton = li.getComponent(LinkDefault)
      expect(editSetButton.vm.to).toEqual(expect.objectContaining({ name: 'cards' }))
    })
  })
})
