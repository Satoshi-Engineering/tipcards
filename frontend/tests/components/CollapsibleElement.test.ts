import CollapsibleElement from '@/components/CollapsibleElement.vue'
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

describe('CollapsibleElement', () => {
  it('renders the title, the content is initially not rendered', async () => {
    // Arrange
    const wrapper = mount(CollapsibleElement, {
      props: {
        title: 'Title',
      },
      slots: {
        default: 'Content',
      },
    })

    // Act
    const title = wrapper.find('[data-test="collapsible-element-title"]')
    const content = wrapper.find('[data-test="collapsible-element-content"]')

    // Assert
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Title')
    expect(content.exists()).toBe(true)
    expect(content.text()).toBe('Content')
    expect(content.isVisible()).toBe(false)
  })

  it('displays the content after clicking on the title', async () => {
    // Arrange
    const wrapper = mount(CollapsibleElement, {
      props: {
        title: 'Title',
      },
      slots: {
        default: 'Content',
      },
    })

    // Act
    const title = wrapper.find('[data-test="collapsible-element-title"]')
    const content = wrapper.find('[data-test="collapsible-element-content"]')
    title
      .trigger('click')
      .then(() => {
        // Assert
        expect(content.isVisible()).toBe(true)
      })
  })

  it('renders the correct level of headline', async () => {
    // Arrange
    const wrapper = mount(CollapsibleElement, {
      props: {
        title: 'Title',
        level: 'h2',
      },
      slots: {
        default: 'Content',
      },
    })

    // Act
    const title = wrapper.find('[data-test="collapsible-element-title"]')

    expect(title.find('h2').exists()).toBe(true)
  })
})
