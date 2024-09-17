import ModalDefault from '@/components/ModalDefault.vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, it, expect, assert, beforeAll, vi } from 'vitest'

import '../mocks/i18n'

beforeAll(() => {
  HTMLDialogElement.prototype.show = vi.fn(function mock(this: HTMLDialogElement) {
    this.open = true
  })
  HTMLDialogElement.prototype.showModal = vi.fn(function mock(this: HTMLDialogElement) {
    this.open = true
  })
  HTMLDialogElement.prototype.close = vi.fn(function mock(this: HTMLDialogElement) {
    this.dispatchEvent(new Event('close'))
    this.open = false
  })
})

describe('ModalDefault', () => {
  it('teleports the dialog to the document\'s body', async () => {
    mount(ModalDefault, {
      slots: {
        default: 'This is the content',
      },
    })

    const teleportedDialog = document.body.querySelector('dialog[data-test="modal"]')
    assert(teleportedDialog, 'Dialog was not teleported to the document\'s body')

    const content = teleportedDialog?.querySelector('[data-test="modal-content"]')
    expect(content?.textContent).toBe('This is the content')
  })

  it('does not render the close button if specified by prop noCloseButton', async () => {
    const wrapper = mount(ModalDefault, {
      props: {
        noCloseButton: true,
      },
      slots: {
        default: 'This is the content',
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    const closeButton = wrapper.find('[data-test="modal-close-button"]')
    expect(closeButton.exists()).toBe(false)
  })

  it('renders custom close button text if specified by prop closeButtonText', async () => {
    const wrapper = mount(ModalDefault, {
      props: {
        closeButtonText: 'Close custom text',
      },
      slots: {
        default: 'This is the content',
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    const closeButton = wrapper.find('[data-test="modal-close-button"]')
    expect(closeButton.text()).toBe('Close custom text')
  })

  it('emits close when the dialog close method is called', async () => {
    const wrapper = mount(ModalDefault, {
      props: {
        closeButtonText: 'Close custom text',
      },
      slots: {
        default: 'This is the content',
      },
      global: {
        stubs: {
          teleport: true,
        },
      },
    })

    await flushPromises()
    const dialog = wrapper.find<HTMLDialogElement>('[data-test="modal"]')
    expect(dialog.element.open).toBe(true)

    dialog.element.close()
    expect(wrapper.emitted('close')).toBeTruthy()
  })

})
