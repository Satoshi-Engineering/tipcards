import { mount } from '@vue/test-utils'
import { beforeAll, afterAll, describe, it, expect } from 'vitest'
import { h } from 'vue'

import '../../mocks/i18n'

import SliderDefault from '@/components/slider/SliderDefault.vue'
import SlideDefault from '@/components/slider/SlideDefault.vue'
import { setLocale } from '@/modules/initI18n'

let originalGetBoundingClientRect: () => DOMRect

beforeAll(() => {
  originalGetBoundingClientRect = window.HTMLElement.prototype.getBoundingClientRect
  window.HTMLElement.prototype.getBoundingClientRect = () => {
    return {
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      toJSON: () => {},
    }
  }
})

afterAll(() => {
  window.HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect
})

describe('SliderDefault', () => {
  it('renders a slider', async () => {
    const wrapper = mount(SliderDefault, {
      slots: {
        default: () => [
          h(SlideDefault, () => 'Satoshi Engineering'),
          h(SlideDefault, () => 'Slide 2'),
        ],
      },
    })
    // onMounted calculates the slideCount and then re-renders the pagination. wait for the re-render
    await wrapper.vm.$nextTick()

    const slides = wrapper.findAll('[data-test="slide-default"]')
    expect(slides.length).toBe(2)
    expect(slides[0].text()).toBe('Satoshi Engineering')
    expect(wrapper.find('ul').attributes('style')).toContain('transform: translateX(0px);')
  })

  it('navigates to the second slide', async () => {
    const wrapper = mount(SliderDefault, {
      slots: {
        default: () => [
          h(SlideDefault, () => 'Satoshi Engineering'),
          h(SlideDefault, () => 'Slide 2'),
        ],
      },
    })
    // onMounted calculates the slideCount and then re-renders the pagination. wait for the re-render
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('[data-test="slider-default-pagination"] button')
    expect(buttons.length).toBe(2)
    await wrapper.findAll('[data-test="slider-default-pagination"] button')[1].trigger('click')
    expect(wrapper.find('ul').attributes('style')).toContain('transform: translateX(-100px);')
  })

  it('has right-to-left language support', async () => {
    await setLocale('he')
    const wrapper = mount(SliderDefault, {
      slots: {
        default: () => [
          h(SlideDefault, () => 'Satoshi Engineering'),
          h(SlideDefault, () => 'Slide 2'),
        ],
      },
    })
    // onMounted calculates the slideCount and then re-renders the pagination. wait for the re-render
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('[data-test="slider-default-pagination"] button')
    expect(buttons.length).toBe(2)
    await wrapper.findAll('[data-test="slider-default-pagination"] button')[1].trigger('click')
    expect(wrapper.find('ul').attributes('style')).toContain('transform: translateX(100px);')
  })
})
