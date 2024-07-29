import i18n from '../../mocks/i18n'
import '../../mocks/pinia'
import '../../mocks/router'

import { mount } from '@vue/test-utils'
import { describe, it, test, expect, vi } from 'vitest'

import TheMainNav from '@/components/layout/theMainNav/TheMainNav.vue'
import { useAuthStore } from '@/stores/auth'

describe('TheMainNav', () => {
  const authStore = vi.mocked(useAuthStore())

  it('renders TheMainNav and "Home" as its first item', async () => {
    const wrapper = mount(TheMainNav)

    const fistItem = wrapper.find('li')
    expect(fistItem.text()).toBe(i18n.global.t('nav.index'))
  })

  it('emits the itemSelected event on main nav item click', async () => {
    const wrapper = mount(TheMainNav)
    const routerLinks = wrapper.findAll('li > a')
    expect(wrapper.emitted('itemSelected')).toBeFalsy()
    await routerLinks[routerLinks.length - 1].trigger('click')
    expect(wrapper.emitted('itemSelected')).toBeTruthy()
  })

  test('main nav items have underline on hover', async () => {
    const wrapper = mount(TheMainNav)
    const routerLinks = wrapper.findAll('li > a')
    routerLinks.forEach(async (routerLink) => {
      expect(routerLink.classes()).not.toContain('underline')
      expect(routerLink.classes()).toContain('hover:underline')
    })
  })

  it('displays the logout button when user is logged in', async () => {
    const wrapper = mount(TheMainNav)
    authStore.isLoggedIn = true
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="main-nav-link-login"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="main-nav-link-logout"]').exists()).toBe(true)
  })

  it('hides the logout button and displays the login button when user is logged out', async () => {
    const wrapper = mount(TheMainNav)
    authStore.isLoggedIn = false
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-test="main-nav-link-login"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="main-nav-link-logout"]').exists()).toBe(false)
  })
})
