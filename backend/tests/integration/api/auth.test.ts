import { describe, it, expect } from 'vitest'
import axios, { AxiosError } from 'axios'
import { randomUUID } from 'crypto'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { ErrorCode } from '@shared/data/Errors.js'
import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import hashSha256 from '@backend/services/hashSha256.js'

import FrontendSimulator from '../lib/frontend/FrontendSimulator.js'
import HDWallet from '../lib/HDWallet/HDWallet.js'
import { authData } from '../lib/apiData.js'
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

const accountName = `${hashSha256(randomUUID())} accountName`
const displayName = `${hashSha256(randomUUID())} accoundisplayNametName`
const email = `${hashSha256(randomUUID())}@email.com`

describe('auth', () => {
  failEarly.it('should not be able to refresh, if no login has happened', async () => {
    let caughtError: AxiosError | undefined

    try {
      await frontend.authRefresh()
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
  })

  failEarly.it('should login', async () => {
    const createResponse = await frontend.authCreate()

    expect(createResponse.data).toEqual(expect.objectContaining({
      status: 'success',
      data: {
        encoded: expect.any(String),
        hash: expect.any(String),
      },
    }))

    const loginResponse = await lnurlAuth.loginWithLNURLAuth(createResponse.data.data.encoded)
    expect(loginResponse.data).toEqual(expect.objectContaining({
      status: 'OK',
    }))

    const authStatusResponse = await frontend.authStatus()

    expect(authStatusResponse.data).toEqual(expect.objectContaining(    {
      status: 'success',
      data: {
        accessToken: expect.any(String),
      },
    }))
  })

  failEarly.it('should fail the login, if it has already been called', async () => {
    let caughtError: AxiosError | undefined

    try {
      await frontend.authStatus()
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
    expect(caughtError?.response?.data).toEqual(expect.objectContaining({
      status: 'error',
      message: expect.any(String),
    }))
  })

  failEarly.it('should get a new access token', async () => {
    const response = await frontend.authRefresh()
    expect(response.data).toEqual(expect.objectContaining(authData.getAuthRefreshTestObject()))
  })

  failEarly.it('should set user profile', async () => {
    const response = await frontend.setProfile(accountName, displayName, email)

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: {
        accountName,
        displayName,
        email,
      },
    }))
  })

  failEarly.it('should get user profile', async () => {
    const response = await frontend.getProfile()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: {
        accountName,
        displayName,
        email,
      },
    }))
  })

  failEarly.it('should logout user', async () => {
    const response= await frontend.logout()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail refreshing the access token, if the user is logged out', async () => {
    let caughtError: AxiosError | undefined

    try {
      await frontend.authRefresh()
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
    expect(caughtError?.response?.data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Refresh token denied.',
      code: ErrorCode.RefreshTokenDenied,
    }))
  })
})
