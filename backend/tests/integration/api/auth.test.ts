import { describe, it, expect } from 'vitest'
import axios from 'axios'
import { TRPCClientError } from '@trpc/client'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import type { AppRouter as AuthRouter } from '@auth/trpc/index.js'

import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import '../lib/initAxios.js'
import FailEarly from '../../FailEarly.js'

const failEarly = new FailEarly(it)

const randomMnemonic = HDWallet.generateRandomMnemonic()
const hdWallet = new HDWallet(randomMnemonic)
const randomSigningKey = hdWallet.getNodeAtPath(0,0,0)
const lnurlAuth = new LNURLAuth({
  publicKeyAsHex: randomSigningKey.getPublicKeyAsHex(),
  privateKeyAsHex: randomSigningKey.getPrivateKeyAsHex(),
})
const frontend = new FrontendSimulator(randomMnemonic)

describe('auth', () => {
  it('should login', async () => {
    const createResponse = await frontend.authCreateLnUrlAuth()

    const callbackUrl = lnurlAuth.getLNURLAuthCallbackUrl(createResponse.lnurlAuth)
    const loginResponse = await axios.get(callbackUrl.toString())
    expect(loginResponse.data).toEqual(expect.objectContaining({
      status: 'OK',
    }))

    const authStatusResponse = await frontend.authLoginWithLnurlAuthHash()

    expect(authStatusResponse).toEqual(expect.objectContaining({
      accessToken: expect.any(String),
    }))
  })

  failEarly.it('should fail the login, if it has already been called', async () => {
    let caughtError: TRPCClientError<AuthRouter> | undefined

    try {
      await frontend.authLoginWithLnurlAuthHash()
    } catch (error) {
      caughtError = error as TRPCClientError<AuthRouter>
    }
    expect(caughtError).toBeInstanceOf(TRPCClientError)
    expect(caughtError?.data?.httpStatus).toBe(401)
    expect(caughtError?.data?.code).toBe('UNAUTHORIZED')
  })

  failEarly.it('should get a new access token', async () => {
    const response = await frontend.authRefreshRefreshToken()
    expect(response).toEqual(expect.objectContaining({
      accessToken: expect.any(String),
    }))
  })

  failEarly.it('should logout user', async () => {
    await frontend.logout()
  })

  failEarly.it('should fail refreshing the access token, if the user is logged out', async () => {
    let caughtError: TRPCClientError<AuthRouter> | undefined

    try {
      await frontend.authRefreshRefreshToken()
    } catch (error) {
      caughtError = error as TRPCClientError<AuthRouter>
    }
    expect(caughtError).toBeInstanceOf(TRPCClientError)
    expect(caughtError?.data?.httpStatus).toBe(401)
  })
})
