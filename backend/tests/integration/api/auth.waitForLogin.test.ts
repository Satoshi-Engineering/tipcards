import '../initEnv'

import { AxiosResponse } from 'axios'

import { retryFunctionWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/timingUtils'

import FailEarly from '../../FailEarly'
import FrontendSimulator from '../frontend/FrontendSimulator'
import LNURLAuth from '../lightning/LNURLAuth'
import HDWallet from '../lightning/HDWallet'

const failEarly = new FailEarly(it)


const frontend = new FrontendSimulator()
const randomSigningKey = HDWallet.generateRandomNode()
const lnurlAuth = new LNURLAuth(randomSigningKey)

afterAll(() => {
  frontend.deinitSocketConnection()
})

describe('auth wait for login (socket.io)', () => {
  failEarly.it('should connect to socket in 2 sec', async () => {
    await frontend.initSocketConnectionWithBackend()

    expect(frontend.hasSocketConnection()).toBe(true)
    expect(frontend.getLastSocketError()).toBe(null)
  })

  failEarly.it('should recieve loggedIn socket event in 2 sec, after login with lnurlauth', async () => {
    if (!frontend.hasSocketConnection()) {
      throw Error('socket should be an instance and connected')
    }

    const response: AxiosResponse = await frontend.authCreate()
    expect(frontend.authServiceLoginHash).not.toBe('')

    frontend.emitSocketEventWaitForLogin(frontend.authServiceLoginHash)
    await lnurlAuth.loginWithLNURLAuth(response.data.data.encoded)

    await retryFunctionWithDelayUntilSuccessWithMaxAttempts(() => frontend.hasLoggedInEventRecieved(), 20)

    expect(frontend.hasLoggedInEventRecieved()).toBe(true)
  })
})
