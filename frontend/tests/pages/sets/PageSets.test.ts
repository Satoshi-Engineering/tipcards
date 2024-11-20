import '../../mocks/i18n'
import '../../mocks/router'
import testingPinia from '../../mocks/pinia'
import '../../mocks/intersectionObserver'
import '../../mocks/modules/useTRpc'
// import { setsToReturn } from  '../../mocks/stores/sets'

import { mount, config, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia } from 'pinia'

import { useAuthStore } from '@/stores/auth'
import { useSetsStore } from '@/stores/sets'
import PageSets from '@/pages/sets/PageSets.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { createSet } from '../../data/set'

config.global.stubs.TheLayout = {
  props: ['loginBanner'],
  template: '<slot />',
}
config.global.stubs.UserErrorMessages = { template: '<div />' }

describe('PageSets', () => {
  setActivePinia(testingPinia)

  const authStore = vi.mocked(useAuthStore())
  const setsStore = vi.mocked(useSetsStore())
  const testSets = [
    createSet({ settings: { name: 'set1' } }),
    createSet({ id: 'set2' }),
    createSet({ id: 'set3' }),
  ]

  beforeEach(() => {
    authStore.isLoggedIn = false
    setsStore.sets = []
    setsStore.loadSets = vi.fn()
  })

  it('should show a logged out sets page', async () => {
    authStore.isLoggedIn = false

    const wrapper = mount(PageSets)
    await flushPromises()

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
    await flushPromises()

    expect(wrapper.find('[data-test=please-login-section]').exists()).toBe(false)
    expect(wrapper.find('[data-test=logged-in]').exists()).toBe(true)
  })

  it('should show an empty sets page', async () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    await flushPromises()

    expect(wrapper.find('[data-test=sets-list-empty]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(false)
  })

  it('should show a list of named and nameless sets', async () => {
    authStore.isLoggedIn = true

    setsStore.sets = testSets

    const wrapper = mount(PageSets)
    await flushPromises()

    expect(wrapper.find('[data-test=sets-list-empty]').exists()).toBe(false)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test=sets-list-with-data] li').length).toBe(testSets.length)
    wrapper.findAll('[data-test=sets-list-with-data] li').forEach((li) => {
      const editSetButton = li.getComponent(LinkDefault)
      expect(editSetButton.vm.to).toEqual(expect.objectContaining({ name: 'cards' }))
    })
  })

  it('should display sets or the logged out section depending on loggedIn status', async () => {
    authStore.isLoggedIn = false

    setsStore.sets = testSets

    const wrapper = mount(PageSets)
    await flushPromises()
    expect(wrapper.find('[data-test=please-login-section]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(false)

    authStore.isLoggedIn = true
    await flushPromises()

    expect(wrapper.find('[data-test=sets-list-empty]').exists()).toBe(false)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(true)

    authStore.isLoggedIn = false
    await flushPromises()
    expect(wrapper.find('[data-test=please-login-section]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-with-data]').exists()).toBe(false)
  })
})
