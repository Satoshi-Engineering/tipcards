import '../../../mocks/process.env'
import '../mocks/client'
import { addData } from '../mocks/database'

import { getLandingPage } from '@backend/database/drizzle/queriesRedis'
import {
  createLandingPageTypeExternal,
  createUser,
  createUserCanUseLandingPage,
} from '../../../../drizzleData'

describe('getLandingPage', () => {
  it('should return null if Landing Page does not exist', async () => {
    const landingPage = await getLandingPage('some landingpage id that doesnt exist')
    expect(landingPage).toBeNull()
  })

  it('should return a landingpage that belongs to a user', async () => {
    const user = createUser()
    const landingPage = createLandingPageTypeExternal()
    const userCanUseLandingPage = createUserCanUseLandingPage(user, landingPage)

    addData({
      landingPages: [landingPage],
      users: [user],
      userCanUseLandingPages: [userCanUseLandingPage],
    })

    const landingPageResult = await getLandingPage(landingPage.id)
    expect(landingPageResult).toEqual(expect.objectContaining({
      id: landingPage.id,
      name: landingPage.name,
      url: landingPage.url,
      type: landingPage.type,
      userId: user.id,
    }))
  })

  it('should return null, because in redis a landing page has to have a userId (in drizzle the relation to a user is optional)', async () => {
    const landingPage = createLandingPageTypeExternal()

    addData({
      landingPages: [landingPage],
    })

    const landingPageResult = await getLandingPage(landingPage.id)
    expect(landingPageResult).toBeNull()
  })
})
