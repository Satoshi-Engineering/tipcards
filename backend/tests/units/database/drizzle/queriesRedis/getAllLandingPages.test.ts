import '../../../mocks/process.env'
import '../mocks/queries'

import { getAllLandingPages } from '@backend/database/drizzle/queriesRedis'
import {
  createLandingPagesTypeExternal,
  createUserCanUseLandingPage,
  createUsers,
} from '../../../../drizzleData'
import { addData } from '../mocks/queries'
import { LandingPage, User, UserCanUseLandingPage } from '@backend/database/drizzle/schema'

describe('getAllLandingPages', () => {
  it('should return a list of landing pages', async () => {
    const LANDING_PAGE_COUNT = 5
    const landingPages: LandingPage[] = createLandingPagesTypeExternal(LANDING_PAGE_COUNT)
    const users: User[] = createUsers(LANDING_PAGE_COUNT)
    const userCanUseLandingPages: UserCanUseLandingPage[]  = Array(LANDING_PAGE_COUNT).fill('').map((v, i) => createUserCanUseLandingPage(users[i], landingPages[i]))

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
