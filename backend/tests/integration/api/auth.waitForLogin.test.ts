import { describe, it, expect, afterAll } from 'vitest'
import axios from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import { retryFunctionWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/timingUtils.js'
import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

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
  failEarly.it('should connect to socket', async () => {
    await frontend.initSocketConnectionWithBackend()

    expect(frontend.hasSocketConnection()).toBe(true)
    expect(frontend.getLastSocketError()).toBe(null)
    expect(frontend.hasLoggedInEventRecieved()).toBe(false)
  })

  failEarly.it('should recieve loggedIn socket event in 2 sec, after login with lnurlauth', async () => {
    if (!frontend.hasSocketConnection()) {
      throw Error('socket should be an instance and connected')
    }

    expect(frontend.hasLoggedInEventRecieved()).toBe(false)
    const response = await frontend.authCreate()
    expect(frontend.authServiceLoginHash).not.toBe('')

    frontend.emitSocketEventWaitForLogin(frontend.authServiceLoginHash)
    const url = lnurlAuth.getLNURLAuthCallbackUrl(response.lnurlAuth)
    await axios.get(url.toString())

    await retryFunctionWithDelayUntilSuccessWithMaxAttempts(() => frontend.hasLoggedInEventRecieved(), 20)

    expect(frontend.hasLoggedInEventRecieved()).toBe(true)
  })
})
