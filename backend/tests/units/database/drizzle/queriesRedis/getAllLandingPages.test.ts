import '../../../mocks/process.env'
import '../mocks/queries'

import { getAllLandingPages } from '@backend/database/drizzle/queriesRedis'
import {
  createLandingPageTypeExternal,
  createUser,
  createUserCanUseLandingPage,
} from '../../../../drizzleData'
import { addData } from '../mocks/queries'
import { LandingPage, User, UserCanUseLandingPage } from '@backend/database/drizzle/schema'

describe('getAllLandingPages', () => {
  it('should return and empty list of landing pages', async () => {
    const landingPages = await getAllLandingPages()
    expect(landingPages).toHaveLength(0)
  })

  it('should return a list of landing pages', async () => {
    const LANDING_PAGE_COUNT = 5
    const landingPages: LandingPage[]  = Array(LANDING_PAGE_COUNT).fill('').map(() => createLandingPageTypeExternal())
    const users: User[]  = Array(LANDING_PAGE_COUNT).fill('').map(() => createUser())
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
        userCanUseLandingPages.map((mn, i) => { return {
          id: mn.landingPage,
          name: landingPages[i].name,
          url: landingPages[i].url,
          type: landingPages[i].type,
          userId: mn.user,
        }}),
      ),
    )
  })
})
