import { describe, it, expect } from 'vitest'
import axios, { AxiosError } from 'axios'

import '@backend/initEnv' // Info: .env needs to read before imports

import { delay } from '@backend/services/timingUtils'

import FrontendSimulator from '../lib/frontend/FrontendSimulator'
import HDWallet from '../lib/HDWallet/HDWallet'
import { authData } from '../lib/apiData'
import '../lib/initAxios'
import FailEarly from '../../FailEarly'

const failEarly = new FailEarly(it)

const NUM_OF_FRONTENDS = 4
const randomMnemonic = HDWallet.generateRandomMnemonic()
const multipleFrondendSimulatorsWithSameSigningDevice: FrontendSimulator[] = new Array(NUM_OF_FRONTENDS).fill(0).map(() => new FrontendSimulator(randomMnemonic))

describe('logout all other devices', () => {
  failEarly.it('should login all frontends', async () => {
    for (const frontend of multipleFrondendSimulatorsWithSameSigningDevice) {
      await frontend.login()
      // NOTE: Redis specifiy problem: Add delay to prevent backend to write the same user object at the same time. Currently redis has no data lock on user object.
      await delay(250)
    }
  })

  failEarly.it('shoud check if all frontends have different refresh & access Tokens', async () => {
    const refreshTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.refreshToken)
    const refreshTokensAsSet = new Set(refreshTokens)

    expect(refreshTokensAsSet.size).toBe(refreshTokens.length)

    const accessTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.accessToken)
    const accessTokensAsSet = new Set(refreshTokens)

    expect(accessTokensAsSet.size).toBe(accessTokens.length)
  })

  failEarly.it('should refresh all frontends', async () => {
    for (const frontend of multipleFrondendSimulatorsWithSameSigningDevice) {
      await frontend.authRefresh()
      // NOTE: Redis specifiy problem: Add delay to prevent backend to write the same user object at the same time. Currently redis has no data lock on user object.
      await delay(250)
    }
  })

  failEarly.it('shoud check if all frontends still have different refresh & access Tokens', async () => {
    const refreshTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.refreshToken)
    const refreshTokensAsSet = new Set(refreshTokens)

    expect(refreshTokensAsSet.size).toBe(refreshTokens.length)

    const accessTokens = multipleFrondendSimulatorsWithSameSigningDevice.map(f => f.accessToken)
    const accessTokensAsSet = new Set(refreshTokens)

    expect(accessTokensAsSet.size).toBe(accessTokens.length)
  })

  failEarly.it('should logout all frontends, except the first one', async () => {
    const frontend = multipleFrondendSimulatorsWithSameSigningDevice[0]

    const response = await frontend.logoutAllOtherDevices()
    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail the refresh all frontends, except the first one', async () => {
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
