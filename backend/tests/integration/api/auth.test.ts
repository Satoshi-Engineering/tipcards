import axios, { AxiosError } from 'axios'
import { randomUUID } from 'crypto'

import '@backend/initEnv' // Info: .env needs to read before imports

import hashSha256 from '@backend/services/hashSha256'
import { ErrorCode } from '@shared/data/Errors'

import FrontendSimulator from '../lib/frontend/FrontendSimulator'
import LNURLAuth from '../lib/lightning/LNURLAuth'
import HDWallet from '../lib/lightning/HDWallet'
import { authData } from '../lib/apiData'
import FailEarly from '../../FailEarly'

const failEarly = new FailEarly(it)

const randomMnemonic = HDWallet.generateRandomMnemonic()
const hdWallet = new HDWallet(randomMnemonic)
const randomSigningKey = hdWallet.getNodeAtPath(0,0,0)
const lnurlAuth = new LNURLAuth(randomSigningKey)
const frontend = new FrontendSimulator(randomMnemonic)

const accountName = `${hashSha256(randomUUID())} accountName`
const displayName = `${hashSha256(randomUUID())} accoundisplayNametName`
const email = `${hashSha256(randomUUID())}@email.com`

describe('auth', () => {
  failEarly.it('should not be able to refresh, if no login has happened', async () => {
    let caughtError: AxiosError | null = null

    try {
      await frontend.authRefresh()
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
  })

  failEarly.it('should login', async () => {
    let response = await frontend.authCreate()

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: {
        encoded: expect.any(String),
        hash: expect.any(String),
      },
    }))

    response = await lnurlAuth.loginWithLNURLAuth(response.data.data.encoded)
    expect(response.data).toEqual(expect.objectContaining({
      status: 'OK',
    }))

    response = await frontend.authStatus()

    expect(response.data).toEqual(expect.objectContaining(    {
      status: 'success',
      data: {
        accessToken: expect.any(String),
      },
    }))
  })

  failEarly.it('should fail the login, if it has already been called', async () => {
    let caughtError: AxiosError | null = null
    try {
      await frontend.authStatus()
    } catch (error) {
      caughtError = error as AxiosError
    }

    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
    expect(caughtError?.response?.data).toEqual(expect.objectContaining({
      status: 'error',
      data: 'not found' ,
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
    let caughtError: AxiosError | null = null
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
