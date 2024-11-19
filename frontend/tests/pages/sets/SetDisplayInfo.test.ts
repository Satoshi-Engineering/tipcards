import i18n from '../../mocks/i18n'
import '../../mocks/provide'
import '../../mocks/router'

import { describe, it, expect } from 'vitest'

import { SetDto } from '@shared/data/trpc/SetDto'
import SetDisplayInfo from '@/pages/sets/modules/SetDisplayInfo'

describe('SetDisplayInfo', () => {
  it('should create a SetDisplayInfo object with the correct values', () => {
    const set = SetDto.parse({
      id: 'set1-id',
      created: new Date('2012-12-12T12:12:00'),
      changed: new Date('2013-01-13T13:13:00'),
      settings: { name: 'Set1 With Üpper Case L3ttärs §$', numberOfCards: 4 },
    })

    const setDisplayInfo = SetDisplayInfo.create(set, i18n.global)

    expect(setDisplayInfo.displayName).toBe(set.settings.name)
    expect(setDisplayInfo.displayDate).toBe('01/13/2013, 1:13 PM')
    expect(setDisplayInfo.displayNumberOfCards).toBe('4 cards')
    expect(setDisplayInfo.combinedSearchableString).toBe('set1 with üpper case l3ttärs §$ 01/13/2013, 1:13 pm 4 cards')
    expect(setDisplayInfo.combinedSearchableString).toStrictEqual(setDisplayInfo.combinedSearchableString.toLowerCase())
  })
})
