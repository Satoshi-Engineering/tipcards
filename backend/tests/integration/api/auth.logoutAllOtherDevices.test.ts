import { describe, it, expect } from 'vitest'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

import { delay } from '@backend/services/timingUtils.js'
import type { AppRouter as AuthRouter } from '@backend/domain/auth/trpc/index.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'
import { TRPCClientError } from '@trpc/client'

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
      await frontend.authRefreshRefreshToken()
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
    await frontend.authRefreshRefreshToken()

    const response = await frontend.logoutAllOtherDevices()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail to refresh all frontends, except for the first one', async () => {
    const loggedInFrontend = multipleFrondendSimulatorsWithSameSigningDevice[0]
    const loggedOutFrontends = multipleFrondendSimulatorsWithSameSigningDevice.slice(1)

    const authRefreshTokenResponse = await loggedInFrontend.authRefreshRefreshToken()
    expect(authRefreshTokenResponse).toEqual(expect.objectContaining({
      accessToken: expect.any(String),
    }))

    await Promise.all(loggedOutFrontends.map(async (frontend) => {
      let caughtError: TRPCClientError<AuthRouter> | undefined

      try {
        await frontend.authRefreshRefreshToken()
      } catch (error) {
        caughtError = error as TRPCClientError<AuthRouter>
      }
      expect(caughtError).toBeInstanceOf(TRPCClientError)
      expect(caughtError?.data?.httpStatus).toBe(401)
    }))
  })
})
