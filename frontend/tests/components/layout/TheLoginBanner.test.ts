import '../../mocks/i18n'
import '../../mocks/pinia'
import '../../mocks/router'

import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'

import TheLoginBanner from '@/components/layout/TheLoginBanner.vue'
import { useAuthStore } from '@/stores/auth'
import { useModalLoginStore } from '@/stores/modalLogin'

describe('TheLoginBanner', () => {
  const authStore = vi.mocked(useAuthStore())
  const modalLoginStore = vi.mocked(useModalLoginStore())

  it('should not render, if the user is logged in', async () => {
    authStore.isLoggedIn = true
    const wrapper = mount(TheLoginBanner, {
      props: {
        i18nScope: 'global',
      },
    })
    expect(wrapper.text()).toBe('')
    expect(() => wrapper.find('[data-test="login-banner-login"]').text()).toThrowError()
  })

  it('should render, if the user is logged out', async () => {
    authStore.isLoggedIn = false
    const wrapper = mount(TheLoginBanner, {
      props: {
        i18nScope: 'global',
      },
    })
    expect(wrapper.find('[data-test="login-banner-login"]')).toBeDefined()
  })

  it('should show the login modal on link click', async () => {
    authStore.isLoggedIn = false
    const wrapper = mount(TheLoginBanner, {
      props: {
        i18nScope: 'global',
      },
    })
    expect(modalLoginStore.showModalLogin).toBe(false)
    await wrapper.find('[data-test="login-banner-login"]').trigger('click')
    expect(modalLoginStore.showModalLogin).toBe(true)
  })
})
