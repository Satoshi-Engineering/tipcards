import '../../mocks/i18n'
import '../../mocks/router'
import testingPinia from '../../mocks/pinia'
import '../../mocks/intersectionObserver'
import '../../mocks/modules/useTRpc'

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
    setsStore.subscribeToLoggedInChanges = vi.fn()
    setsStore.unsubscribeFromLoggedInChanges = vi.fn()
  })

  it('should show a logged out sets page', async () => {
    authStore.isLoggedIn = false

    const wrapper = mount(PageSets)
    await flushPromises()

    expect(wrapper.find('[data-test=headline]').exists()).toBe(true)
    const newSetButton = wrapper.find('[data-test=button-new-set]')
    expect(newSetButton.exists()).toBe(true)
    expect(newSetButton.getComponent(RouterLinkStub).vm.to).toEqual(expect.objectContaining({ name: 'cards' }))
    expect(wrapper.find('[data-test=sets-list-message-not-logged-in]').exists()).toBe(true)
  })

  it('should show a logged in sets page', async () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    await flushPromises()

    expect(wrapper.find('[data-test=sets-list]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-message-not-logged-in]').exists()).toBe(false)
  })

  it('should show an empty sets page', async () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    await flushPromises()

    expect(wrapper.find('[data-test=sets-list]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-message-empty]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-item]').exists()).toBe(false)
  })

  it('should show a list of named and nameless sets', async () => {
    authStore.isLoggedIn = true

    const wrapper = mount(PageSets)
    await flushPromises()
    setsStore.sets = testSets
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test=sets-list]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-message-empty]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test=sets-list-item]').length).toBe(testSets.length)
    wrapper.findAll('[data-test=sets-list] li').forEach((li) => {
      const editSetButton = li.getComponent(LinkDefault)
      expect(editSetButton.vm.to).toEqual(expect.objectContaining({ name: 'cards' }))
    })
  })

  it('should display sets or the logged out message depending on loggedIn status', async () => {
    authStore.isLoggedIn = false
    const wrapper = mount(PageSets)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test=sets-list-message-not-logged-in]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-item]').exists()).toBe(false)

    authStore.isLoggedIn = true
    setsStore.sets = testSets
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test=sets-list-message-not-logged-in]').exists()).toBe(false)
    expect(wrapper.findAll('[data-test=sets-list-item]').length).toBe(testSets.length)

    authStore.isLoggedIn = false
    setsStore.sets = []
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test=sets-list-message-not-logged-in]').exists()).toBe(true)
    expect(wrapper.find('[data-test=sets-list-item]').exists()).toBe(false)
  })

  it('should load sets when the user logs in', async () => {
    authStore.isLoggedIn = false
    mount(PageSets)
    await flushPromises()

    authStore.isLoggedIn = true
    await flushPromises()

    expect(setsStore.loadSets).toHaveBeenCalledOnce()
  })

  it('should load sets when the component is mounted', async () => {
    authStore.isLoggedIn = true
    mount(PageSets)
    await flushPromises()

    expect(setsStore.loadSets).toHaveBeenCalledOnce()
  })

  it('should unsubscribe from loggedIn changes when the component is unmounted', async () => {
    authStore.isLoggedIn = true
    const wrapper = mount(PageSets)
    await flushPromises()

    wrapper.unmount()

    expect(setsStore.unsubscribeFromLoggedInChanges).toHaveBeenCalledOnce()
  })
})
