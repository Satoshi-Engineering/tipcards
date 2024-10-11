import { describe, it, expect } from 'vitest'
import axios, { AxiosError } from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { delay } from '@backend/services/timingUtils.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import HDWallet from '../lib/HDWallet/HDWallet.js'
import { authData } from '../lib/apiData.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

const failEarly = new FailEarly(it)

const NUM_OF_FRONTENDS = 4
const randomMnemonic = HDWallet.generateRandomMnemonic()
const multipleFrondendSimulatorsWithSameSigningDevice: FrontendSimulator[] = new Array(NUM_OF_FRONTENDS)
  .fill(0)
  .map(() => new FrontendSimulator(randomMnemonic))

describe('logout all other devices', () => {
  failEarly.it('should login all frontends', async () => {
    for (const frontend of multipleFrondendSimulatorsWithSameSigningDevice) {
      await frontend.login()
      // NOTE
      // In redis the refresh tokens were stored in the user object. Even after the switch to drizzle we still
      // build a temporary user object (in the application) that holds all refresh tokens.
      // This is why we need to add a delay to prevent backend to write the same user object at the same time.
      // Also the backend has no data lock on user object.
      await delay(500)
    }
  })

  failEarly.it('should check if all frontends have the same userId but different refresh & access tokens', async () => {
    const userIds = multipleFrondendSimulatorsWithSameSigningDevice.map((frontend) => frontend.userId)
    const userIdsAsSet = new Set(userIds)

    expect(userIdsAsSet.size).toBe(1)

    const refreshTokens = multipleFrondendSimulatorsWithSameSigningDevice.map((frontend) => frontend.refreshToken)
    const refreshTokensAsSet = new Set(refreshTokens)

    expect(refreshTokensAsSet.size).toBe(refreshTokens.length)

    const accessTokens = multipleFrondendSimulatorsWithSameSigningDevice.map((frontend) => frontend.accessToken)
    const accessTokensAsSet = new Set(refreshTokens)

    expect(accessTokensAsSet.size).toBe(accessTokens.length)
  })

  failEarly.it('should refresh all frontends', async () => {
    for (const frontend of multipleFrondendSimulatorsWithSameSigningDevice) {
      await frontend.authRefresh()
      // NOTE
      // In redis the refresh tokens were stored in the user object. Even after the switch to drizzle we still
      // build a temporary user object (in the application) that holds all refresh tokens.
      // This is why we need to add a delay to prevent backend to write the same user object at the same time.
      // Also the backend has no data lock on user object.
      await delay(500)
    }
  })

  failEarly.it('should check if all frontends still have different refresh & access tokens', async () => {
    const refreshTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.refreshToken)
    const refreshTokensAsSet = new Set(refreshTokens)

    expect(refreshTokensAsSet.size).toBe(refreshTokens.length)

    const accessTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.accessToken)
    const accessTokensAsSet = new Set(refreshTokens)

    expect(accessTokensAsSet.size).toBe(accessTokens.length)
  })

  failEarly.it('should logout all frontends, except the first one', async () => {
    const frontend = multipleFrondendSimulatorsWithSameSigningDevice[0]
    // make sure two auth tokens exist
    await frontend.authRefresh()

    const response = await frontend.logoutAllOtherDevices()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail to refresh all frontends, except for the first one', async () => {
    const loggedInFrontend = multipleFrondendSimulatorsWithSameSigningDevice[0]
    const loggedOutFrontends = multipleFrondendSimulatorsWithSameSigningDevice.slice(1)

    const response = await loggedInFrontend.authRefresh()
    expect(response.data).toEqual(expect.objectContaining(authData.getAuthRefreshTestObject()))

    await Promise.all(loggedOutFrontends.map(async (frontend) => {
      let caughtError: AxiosError | undefined

      try {
        await frontend.authRefresh()
      } catch (error) {
        caughtError = error as AxiosError
      }
      expect(axios.isAxiosError(caughtError)).toBe(true)
      expect(caughtError?.response?.status).toBe(401)
    }))
  })
})
