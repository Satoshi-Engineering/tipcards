import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../../mocks/router'

import ButtonDefault from '@/components/buttons/ButtonDefault.vue'

describe('ButtonDefault', () => {
  it('renders a router link', async () => {
    const wrapper = mount(ButtonDefault, {
      props: {
        to: { name: 'home' },
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const link = wrapper.find('a')
    expect(link.getComponent(RouterLinkStub).vm.to).toEqual({ name: 'home' })
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Satoshi Engineering')
  })

  it('renders a hyperlink', async () => {
    const wrapper = mount(ButtonDefault, {
      props: {
        href: 'https://satoshiengineering.com',
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('https://satoshiengineering.com')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.text()).toBe('Satoshi Engineering')
  })

  it('renders a button', async () => {
    const wrapper = mount(ButtonDefault, {
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Satoshi Engineering')
  })

  it('renders a disabled button', async () => {
    const wrapper = mount(ButtonDefault, {
      slots: {
        default: 'Satoshi Engineering',
      },
      props: {
        disabled: true,
      },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('disabled')).toBeDefined()
    expect(button.text()).toBe('Satoshi Engineering')
  })

  it('renders a disabled button when loading', async () => {
    const wrapper = mount(ButtonDefault, {
      slots: {
        default: 'Satoshi Engineering',
      },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('disabled')).toBeUndefined()
    expect(button.text()).toBe('Satoshi Engineering')

    await wrapper.setProps({ loading: true })
    expect(button.attributes('disabled')).toBeDefined()
  })
})
