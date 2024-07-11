import { describe, it, expect, afterAll } from 'vitest'
import { AxiosResponse } from 'axios'

import '@backend/initEnv' // Info: .env needs to read before imports

import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import { retryFunctionWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/timingUtils.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import '../lib/initAxios'
import FailEarly from '../../FailEarly.js'
import HDWallet from '../lib/HDWallet/HDWallet.js'

const failEarly = new FailEarly(it)

const frontend = new FrontendSimulator()
const randomSigningKey = HDWallet.generateRandomNode()
const lnurlAuth = new LNURLAuth({
  publicKeyAsHex: randomSigningKey.getPublicKeyAsHex(),
  privateKeyAsHex: randomSigningKey.getPrivateKeyAsHex(),
})

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
