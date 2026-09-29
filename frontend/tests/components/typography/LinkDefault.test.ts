import '../../mocks/router'

import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import LinkDefault from '@/components/typography/LinkDefault.vue'

describe('LinkDefault', () => {
  it('renders a router link', async () => {
    const wrapper = mount(LinkDefault, {
      props: {
        to: { name: 'home' },
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    expect(wrapper.findComponent(RouterLinkStub).vm.to).toEqual({ name: 'home' })
    const link = wrapper.find('a')
    expect(link.exists()).toBe(true)
    expect(link.text()).toBe('Satoshi Engineering')
  })

  it('renders a hyperlink', async () => {
    const wrapper = mount(LinkDefault, {
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
    const wrapper = mount(LinkDefault, {
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Satoshi Engineering')
  })

  it('does not apply underline styles when disabled', () => {
    const wrapper = mount(LinkDefault, {
      props: {
        noUnderline: true,
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })

    expect(wrapper.classes()).toContain('no-underline')
    expect(wrapper.classes()).not.toContain('underline')
    expect(wrapper.classes()).not.toContain('hover:no-underline')
    expect(wrapper.classes()).not.toContain('hover:underline')
  })

  it('sets target to _blank if the href begins with http', async () => {
    const wrapper = mount(LinkDefault, {
      props: {
        href: 'https://satoshiengineering.com',
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const link = wrapper.find('a')
    expect(link.attributes('target')).toBe('_blank')
  })

  it('does not set target to _blank if the href is a relative link', async () => {
    const wrapper = mount(LinkDefault, {
      props: {
        href: '/about',
      },
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const link = wrapper.find('a')
    expect(link.attributes('target')).not.toBe('_blank')
  })
})
