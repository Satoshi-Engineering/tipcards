import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import '../mocks/router'
import '../mocks/i18n'

import LightningQrCode from '@/components/LightningQrCode.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'

describe('LightningQrCode', () => {
  it('renders a qr code', async () => {
    const wrapper = mount(LightningQrCode, {
      props: {
        headline: 'This is the headline',
        value: 'lnurl1dp68gurn8ghj7er9wch8g6tsvdshyern9e5k7tmpwp5j7mrww4exctm3wgkkxmmyv5khgetnwse6dyf9',
      },
    })
    const headline = wrapper.find('[data-test="lightning-qr-code-headline"]')
    expect(headline.text()).toBe('This is the headline')

    const copyToClipboard = wrapper.getComponent(CopyToClipboard)
    expect(copyToClipboard).toBeDefined()
    expect(copyToClipboard.vm.text).toEqual('lnurl1dp68gurn8ghj7er9wch8g6tsvdshyern9e5k7tmpwp5j7mrww4exctm3wgkkxmmyv5khgetnwse6dyf9')

    const button = wrapper.find('[data-test="lightning-qr-code-button-open-in-wallet"]')
    expect(button.attributes().href).toContain('lnurl1dp68gurn8ghj7er9wch8g6tsvdshyern9e5k7tmpwp5j7mrww4exctm3wgkkxmmyv5khgetnwse6dyf9')
  })
})
