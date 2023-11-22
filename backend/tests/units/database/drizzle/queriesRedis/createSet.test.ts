import '../../../mocks/process.env'
import {
  insertOrUpdateSet,
  insertOrUpdateSetSettings,
  insertOrUpdateUserCanUseSet,
} from '../mocks/queries'

import { createUser } from '../../../../drizzleData'
import {
  createSet as createSetData,
  createSetSettings,
} from '../../../../redisData'

import { createSet } from '@backend/database/drizzle/queriesRedis'
import { Set } from '@backend/database/redis/data/Set'

describe('createSet', () => {
  it('should create a set with settings and userId', async () => {
    const user = createUser()
    const set: Set = createSetData()
    set.settings = createSetSettings()
    set.userId = user.id

    await createSet(set)
    expect(insertOrUpdateSet).toHaveBeenCalledWith(expect.objectContaining({
      id: set.id,
      created: expect.any(Date),
      changed: expect.any(Date),
    }))
    expect(insertOrUpdateSetSettings).toHaveBeenCalledWith(expect.objectContaining({
      set: set.id,
      name: set.settings?.setName,
      numberOfCards: set.settings?.numberOfCards,
      cardHeadline: set.settings?.cardHeadline,
      cardCopytext: set.settings?.cardCopytext,
      image: set.settings?.cardsQrCodeLogo,
      landingPage: set.settings?.landingPage,
    }))
    expect(insertOrUpdateUserCanUseSet).toHaveBeenCalledWith(expect.objectContaining({
      user: user.id,
      set: set.id,
      canEdit: true,
    }))
  })
})
