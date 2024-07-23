import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { dateToUnixTimestamp } from '@backend/database/deprecated/transforms/dateHelpers.js'
import { getAllUsers } from '@backend/database/deprecated/queries.js'

import {
  createUser, createProfileForUser,
  createLandingPageTypeExternal, createUserCanUseLandingPage,
} from '../../../drizzleData.js'

describe('getAllUsers', () => {
  it('should return all users', async () => {
    const user1 = createUser()
    const profile1 = createProfileForUser(user1)
    const user2 = createUser()
    const profile2 = createProfileForUser(user2)
    const user3 = createUser()
    const profile3 = createProfileForUser(user3)
    const landingPage = createLandingPageTypeExternal()
    const userCanUseLandingPage = createUserCanUseLandingPage(user3, landingPage, true)

    addData({
      users: [user1, user2, user3],
      profiles: [profile1, profile2, profile3],
      landingPages: [landingPage],
      userCanUseLandingPages: [userCanUseLandingPage],
    })

    const users = await getAllUsers()
    expect(users).toEqual(expect.arrayContaining([expect.objectContaining({
      id: user1.id,
      created: dateToUnixTimestamp(user1.created),
      lnurlAuthKey: user1.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: expect.objectContaining({
        displayName: profile1.displayName,
        accountName: profile1.accountName,
        email: profile1.email,
      }),
      permissions: [],
    }), expect.objectContaining({
      id: user2.id,
      created: dateToUnixTimestamp(user2.created),
      lnurlAuthKey: user2.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: expect.objectContaining({
        displayName: profile2.displayName,
        accountName: profile2.accountName,
        email: profile2.email,
      }),
      permissions: [],
    }), expect.objectContaining({
      id: user3.id,
      created: dateToUnixTimestamp(user3.created),
      lnurlAuthKey: user3.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: [landingPage.id],
      allowedRefreshTokens: null,
      profile: expect.objectContaining({
        displayName: profile3.displayName,
        accountName: profile3.accountName,
        email: profile3.email,
      }),
      permissions: [],
    })]))
  })
})
