import { describe, it, expect } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { dateToUnixTimestamp } from '@backend/database/deprecated/transforms/dateHelpers.js'
import { getUserById } from '@backend/database/deprecated/queries.js'

import {
  createProfileForUser,
  createUser,
  createAllowedRefreshTokensDepricated,
  createImage, createUserCanUseImage,
  createLandingPageTypeExternal, createUserCanUseLandingPage,
} from '../../../drizzleData.js'

describe('getUserById', () => {
  it('should return null if a user does not exist', async () => {
    const user = await getUserById('some user id that doesnt exist')
    expect(user).toBeNull()
  })

  it('should throw an error if the user has no profile', async () => {
    const userData = createUser()

    addData({
      users: [userData],
    })

    await expect(async () => await getUserById(userData.id)).rejects.toThrow(Error)
  })

  it('should return a user', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)

    addData({
      users: [userData],
      profiles: [profileData],
    })

    const userResutlt = await getUserById(userData.id)
    expect(userResutlt).toEqual(expect.objectContaining({
      id: userData.id,
      created: dateToUnixTimestamp(userData.created),
      lnurlAuthKey: userData.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: null,
      profile: {
        displayName: profileData.displayName,
        accountName: profileData.accountName,
        email: profileData.email,
      },
      permissions: [],
    }))
  })

  it('should return a user with availableCardsLogos and availableLandingPages', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)
    const imageData1 = createImage()
    const userCanUseImageData1 = createUserCanUseImage(userData, imageData1, true)
    const imageData2 = createImage()
    const userCanUseImageData2 = createUserCanUseImage(userData, imageData2, true)
    const landingPageData = createLandingPageTypeExternal()
    const userCanUseLandingPageData = createUserCanUseLandingPage(userData, landingPageData, true)

    addData({
      users: [userData],
      profiles: [profileData],
      images: [imageData1, imageData2],
      usersCanUseImages: [userCanUseImageData1, userCanUseImageData2],
      landingPages: [landingPageData],
      userCanUseLandingPages: [userCanUseLandingPageData],
    })

    const userResutlt = await getUserById(userData.id)
    expect(userResutlt).toEqual(expect.objectContaining({
      id: userData.id,
      created: dateToUnixTimestamp(userData.created),
      lnurlAuthKey: userData.lnurlAuthKey,
      availableCardsLogos: expect.arrayContaining([imageData1.id, imageData2.id]),
      availableLandingPages: expect.arrayContaining([landingPageData.id]),
      allowedRefreshTokens: null,
      profile: {
        displayName: profileData.displayName,
        accountName: profileData.accountName,
        email: profileData.email,
      },
      permissions: [],
    }))
  })

  it('should return a user with allowedRefreshTokens', async () => {
    const userData = createUser()
    const profileData = createProfileForUser(userData)
    const allowedRefreshTokenData1 = createAllowedRefreshTokensDepricated(userData)
    const allowedRefreshTokenData2 = createAllowedRefreshTokensDepricated(userData, true)

    addData({
      users: [userData],
      profiles: [profileData],
      allowedRefreshTokens: [allowedRefreshTokenData1, allowedRefreshTokenData2],
    })

    const userResutlt = await getUserById(userData.id)
    expect(userResutlt).toEqual(expect.objectContaining({
      id: userData.id,
      created: dateToUnixTimestamp(userData.created),
      lnurlAuthKey: userData.lnurlAuthKey,
      availableCardsLogos: null,
      availableLandingPages: null,
      allowedRefreshTokens: expect.arrayContaining([
        [allowedRefreshTokenData1.current],
        [allowedRefreshTokenData2.current, allowedRefreshTokenData2.previous],
      ]),
      profile: {
        displayName: profileData.displayName,
        accountName: profileData.accountName,
        email: profileData.email,
      },
      permissions: [],
    }))
  })
})
