import '../mocks/i18n'
import '../mocks/provide'
import '../mocks/router'

import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'

import useLocalStorageSets from '@/modules/useLocalStorageSets'

import { createSetDeprecated, createLocalStorageSet } from '../data/set'

describe('useLocalStorageSets', () => {
  const testComponent = defineComponent({
    setup: () => ({ ...useLocalStorageSets() }),
    template: '<div></div>',
  })

  it('saves and deletes sets', () => {
    const wrapper = mount(testComponent)
    expect(wrapper.vm.hasSetsInLocalStorage).toBe(false)
    expect(wrapper.vm.setsDeprecated.length).toBe(0)

    const set = createSetDeprecated()
    wrapper.vm.saveSet(set)
    expect(wrapper.vm.hasSetsInLocalStorage).toBe(true)
    expect(wrapper.vm.setsDeprecated.length).toBe(1)
    expect(wrapper.vm.setsDeprecated).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: set.id }),
    ]))

    wrapper.vm.deleteSet(set.id)
    expect(wrapper.vm.hasSetsInLocalStorage).toBe(false)
    expect(wrapper.vm.setsDeprecated.length).toBe(0)
  })

  it('reads sets from localStorage and deletes them', () => {
    const set1 = createLocalStorageSet()
    const set2 = createLocalStorageSet()
    localStorage.setItem('savedTipCardsSets', JSON.stringify([set1, set2]))

    const wrapper = mount(testComponent)
    expect(wrapper.vm.hasSetsInLocalStorage).toBe(true)
    expect(wrapper.vm.setsDeprecated.length).toBe(2)
    expect(wrapper.vm.setsDeprecated).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: set1.setId }),
      expect.objectContaining({ id: set2.setId }),
    ]))

    wrapper.vm.deleteAllSets()
    expect(wrapper.vm.hasSetsInLocalStorage).toBe(false)
    expect(wrapper.vm.setsDeprecated.length).toBe(0)
  })
})
