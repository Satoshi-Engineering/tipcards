import '../../mocks/router'

import { mount, RouterLinkStub } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ButtonLinkSkeleton from '@/components/buttons/components/ButtonLinkSkeleton.vue'

describe('LinkDefault', () => {
  it('renders a router link', async () => {
    const wrapper = mount(ButtonLinkSkeleton, {
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
    const wrapper = mount(ButtonLinkSkeleton, {
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
    const wrapper = mount(ButtonLinkSkeleton, {
      slots: {
        default: 'Satoshi Engineering',
      },
    })
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.text()).toBe('Satoshi Engineering')
  })

  it('renders a span', async () => {
    const wrapper = mount(ButtonLinkSkeleton, {
      slots: {
        default: 'Satoshi Engineering',
      },
      props: {
        element: 'span',
      },
    })
    const span = wrapper.find('span')
    expect(span.exists()).toBe(true)
    expect(span.text()).toBe('Satoshi Engineering')
  })

  it('sets target to _blank if the href begins with http', async () => {
    const wrapper = mount(ButtonLinkSkeleton, {
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
    const wrapper = mount(ButtonLinkSkeleton, {
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
