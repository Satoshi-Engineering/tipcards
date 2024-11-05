import '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

import { describe, it, expect } from 'vitest'

import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'
import { SetDto } from '@shared/data/trpc/SetDto'
import { defineComponent, type PropType } from 'vue'
import { mount } from '@vue/test-utils'

describe('SetDisplayInfo', () => {
  const testComponent = defineComponent({
    props: { set: { type: Object as PropType<SetDto>, required: true } },
    setup: (props) => {
      const setDisplayInfo = SetDisplayInfo.create(props.set)
      return { setDisplayInfo }
    },
    template: '<div></div>',
  })

  it('should create a SetDisplayInfo object with the correct values', () => {
    const set = SetDto.parse({
      id: 'set1-id',
      created: new Date('2012-12-12T12:12:00'),
      settings: { name: 'set1', numberOfCards: 4 },
    })

    const wrapper = mount(testComponent, { props: { set } })

    expect(wrapper.vm.setDisplayInfo.displayName).toBe(set.settings.name)
    expect(wrapper.vm.setDisplayInfo.displayDate).toBe('12/12/2012, 12:12 PM')
    expect(wrapper.vm.setDisplayInfo.displayNumberOfCards).toBe('4 cards')
    expect(wrapper.vm.setDisplayInfo.combinedSearchableString).toBe('set1 12/12/2012, 12:12 PM 4 cards')
  })
})
