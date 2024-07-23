import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { getLandingPage } from '@backend/database/deprecated/queries.js'
import {
  createLandingPageTypeExternal,
  createUser,
  createUserCanUseLandingPage,
} from '../../../drizzleData.js'

describe('getLandingPage', () => {
  it('should return null if Landing Page does not exist', async () => {
    const landingPage = await getLandingPage('some landingpage id that doesnt exist')
    expect(landingPage).toBeNull()
  })

  it('should return a landingpage that belongs to a user', async () => {
    const user = createUser()
    const landingPage = createLandingPageTypeExternal()
    const userCanUseLandingPage = createUserCanUseLandingPage(user, landingPage, true)

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

  it('should return a landingpage that belongs to no user', async () => {
    const landingPage = createLandingPageTypeExternal()

    addData({
      landingPages: [landingPage],
    })

    const landingPageResult = await getLandingPage(landingPage.id)
    expect(landingPageResult).toEqual(expect.objectContaining({
      id: landingPage.id,
      name: landingPage.name,
      url: landingPage.url,
      type: landingPage.type,
      userId: null,
    }))
  })
})
