import '../initEnv'
import axios, { AxiosError, AxiosResponse } from 'axios'

import LNBitsWallet from '../lightning/LNBitsWallet'
import FailEarly from '../../FailEarly'
import Frontend from '../Frontend'
import LocalWallet from '../lightning/LocalWallet'

const authWallet = new LocalWallet()
const failEarly = new FailEarly(it)
const frontend = new Frontend()

let authServiceHash = ''
let authServiceAccessToken = ''
let authServiceRefreshToken = ''

const getRefreshTokenFromCookies = (cookies: string[] | undefined) => {
  if (cookies === undefined) {
    throw new Error('no cookies set')
  }

  const match = cookies[0].match(/(^| )refresh_token=(?<refreshToken>[^;]+)/)
  if (match == null) {
    throw new Error('refresh_token in cookies not found or cookie not in cookies[0]')
  }
  if (match.groups == null) {
    throw new Error('refresh_token not found in cookie')
  }

  return match.groups['refreshToken']
}

describe('auth', () => {
  /*
  failEarly.it('should fail with 401, due a fresh, but no login', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.authRefresh()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response).toBeNull()
  })*/

  failEarly.it('should login', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.authCreate()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
      data: {
        encoded: expect.any(String),
        hash: expect.any(String),
      },
    }))

    authServiceHash = response.data.data.hash

    response = await authWallet.loginWithLNURLAuth(response.data.data.encoded)
    expect(response.data).toEqual(expect.objectContaining({
      status: 'OK',
    }))

    try {
      response = await frontend.authStatus(authServiceHash)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data).toEqual(expect.objectContaining(    {
      status: 'success',
      data: {
        accessToken: expect.any(String),
      },
    }))

    authServiceAccessToken = response.data.data.accessToken
    authServiceRefreshToken = getRefreshTokenFromCookies(response.headers['set-cookie'])
  })

  failEarly.it('should fail due hash for auth status has already been used', async () => {
    let caughtError: AxiosError
    try {
      await frontend.authStatus(authServiceHash)
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
    expect(caughtError?.response?.data).toEqual(expect.objectContaining({ status: 'error', data: 'not found' }))
  })

  failEarly.it('should get a new access Token', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.authRefresh('refresh_token='+authServiceRefreshToken)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data).toEqual(expect.objectContaining(    {
      status: 'success',
      data: {
        accessToken: expect.any(String),
      },
    }))

    expect(authServiceAccessToken).not.toBe(response.data.data.accessToken)
    authServiceAccessToken = response.data.data.accessToken
  })

})
