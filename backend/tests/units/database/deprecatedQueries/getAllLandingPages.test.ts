import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import {
  createLandingPagesTypeExternal,
  createUserCanUseLandingPage,
  createUsers,
} from '../../../drizzleData.js'

import { LandingPage, User, UserCanUseLandingPage } from '@backend/database/schema/index.js'
import { getAllLandingPages } from '@backend/database/deprecated/queries.js'

describe('getAllLandingPages', () => {
  it('should return a list of landing pages', async () => {
    const LANDING_PAGE_COUNT = 5
    const landingPages: LandingPage[] = createLandingPagesTypeExternal(LANDING_PAGE_COUNT)
    const users: User[] = createUsers(LANDING_PAGE_COUNT)
    const userCanUseLandingPages: UserCanUseLandingPage[]  = users.map((_, i) => createUserCanUseLandingPage(users[i], landingPages[i], true))

    addData({
      landingPages: landingPages,
      users: users,
      userCanUseLandingPages: userCanUseLandingPages,
    })

    const landingPagesResult = await getAllLandingPages()
    expect(landingPagesResult).toHaveLength(LANDING_PAGE_COUNT)
    expect(landingPagesResult).toEqual(
      expect.arrayContaining(
        userCanUseLandingPages.map((mn, i) => ({
          id: mn.landingPage,
          name: landingPages[i].name,
          url: landingPages[i].url,
          type: landingPages[i].type,
          userId: mn.user,
        })),
      ),
    )
  })
})
