import '../mocks/i18n'
import '../mocks/router'
import '../mocks/pinia'
import '../mocks/modules/useTRpc'
import { useSetsMethods } from  '../mocks/modules/useSets'

import { mount, config, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import PageSets from '@/pages/PageSets.vue'
import LinkDefault from '@/components/typography/LinkDefault.vue'
import { useAuthStore } from '@/stores/auth'
import { createSet } from '../data/set'

config.global.stubs.TheLayout = {
  props: ['loginBanner'],
  template: '<slot />',
}
config.global.stubs.UserErrorMessages = { template: '<div />' }

describe('PageSets', () => {
  const authStore = vi.mocked(useAuthStore())
  const testSets = [
    createSet({ settings: { name: 'set1' } }),
    createSet({ id: 'set2' }),
    createSet({ id: 'set3' }),
  ]

  beforeEach(() => {
    authStore.isLoggedIn = false
    useSetsMethods.getAllSets = vi.fn(async () => [])
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

    useSetsMethods.getAllSets = vi.fn(async () => testSets)

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

    useSetsMethods.getAllSets = vi.fn(async () => testSets)

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
