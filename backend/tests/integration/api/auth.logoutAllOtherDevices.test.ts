import '../initEnv'

import axios, { AxiosResponse, AxiosError } from 'axios'

import FailEarly from '../../FailEarly'
import FrontendSimulator from '../frontend/FrontendSimulator'
import HDWallet from '../lightning/HDWallet'
import { authData } from '../../apiData'

const failEarly = new FailEarly(it)

const NUM_OF_FRONTENDS = 4
const randomMnemonic = HDWallet.generateRandomMnemonic()
const multipleFrondendSimulatorsWithSameSigningDevice: FrontendSimulator[] = new Array(NUM_OF_FRONTENDS).fill(0).map(() => new FrontendSimulator(randomMnemonic))

describe('logout all other devices', () => {
  failEarly.it('should login all frontends', async () => {
    for (const frontend of multipleFrondendSimulatorsWithSameSigningDevice) {
      await frontend.login()
    }
  })

  failEarly.it('should refresh all frontends', async () => {
    await Promise.all(multipleFrondendSimulatorsWithSameSigningDevice.map(async (frontend) => {
      await frontend.authRefresh()
    }))
  })

  failEarly.it('should logout all frontends, except the first one', async () => {
    const frontend = multipleFrondendSimulatorsWithSameSigningDevice[0]

    let response: AxiosResponse | null = null

    try {
      response = await frontend.logoutAllOtherDevices()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail the refresh all frontends, except the first one', async () => {
    const frontend = multipleFrondendSimulatorsWithSameSigningDevice[0]
    const loggedOutFrontends = multipleFrondendSimulatorsWithSameSigningDevice.slice(1)

    const response = await frontend.authRefresh()
    expect(response.data).toEqual(expect.objectContaining(authData.getAuthRefreshTestObject()))

    await Promise.all(loggedOutFrontends.map(async (frontend) => {
      let caughtError: AxiosError | null = null

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
