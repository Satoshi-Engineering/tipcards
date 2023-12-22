import '../initEnv'
import axios, { AxiosError, AxiosResponse } from 'axios'

import FailEarly from '../../FailEarly'
import Frontend from '../Frontend'
import LocalWallet from '../lightning/LocalWallet'
import hashSha256 from '@backend/services/hashSha256'
import { randomUUID } from 'crypto'
import { ErrorCode } from '@shared/data/Errors'

const authWallet = new LocalWallet()
const failEarly = new FailEarly(it)
const frontend = new Frontend()

const accountName = `${hashSha256(randomUUID())} accountName`
const displayName = `${hashSha256(randomUUID())} accoundisplayNametName`
const email = `${hashSha256(randomUUID())}@email.com`

describe('auth', () => {
  failEarly.it('should fail with 401, due a fresh, but no login', async () => {
    let caughtError: AxiosError

    try {
      await frontend.authRefresh()
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
  })

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

    response = await authWallet.loginWithLNURLAuth(response.data.data.encoded)
    expect(response.data).toEqual(expect.objectContaining({
      status: 'OK',
    }))

    try {
      response = await frontend.authStatus()
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
  })

  failEarly.it('should fail due hash for auth status has already been used', async () => {
    let caughtError: AxiosError
    try {
      await frontend.authStatus()
      expect(false).toBe(true)
      return
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

  failEarly.it('should get a new access Token', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.authRefresh()
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
  })

  failEarly.it('should logout user on all other devices', async () => {
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

  failEarly.it('should set user profile', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.setProfile(accountName, displayName, email)
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

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
    let response: AxiosResponse | null = null

    try {
      response = await frontend.getProfile()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

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
    let response: AxiosResponse | null = null

    try {
      response = await frontend.logout()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response.data).toEqual(expect.objectContaining({
      status: 'success',
    }))
  })

  failEarly.it('should fail due user is logged out', async () => {
    let caughtError: AxiosError | null = null
    try {
      const response = await frontend.authRefresh()
      console.error('Request passed successfull')
      console.error(response.data)
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
