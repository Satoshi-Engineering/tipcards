import '../initEnv'
import axios, { AxiosError, AxiosResponse } from 'axios'

import LNBitsWallet from '../lightning/LNBitsWallet'
import FailEarly from '../../FailEarly'
//import { setData } from '../../apiData'
import Frontend from '../Frontend'
import { Set } from '@shared/data/api/Set'
import crypto from 'crypto'
import { ErrorCode } from '@shared/data/Errors'

const wallet = new LNBitsWallet(process.env.LNBITS_ORIGIN || '', process.env.LNBITS_ADMIN_KEY || '')
const failEarly = new FailEarly(it)
const frontend = new Frontend()

const setId = crypto.randomUUID()

type ErrorResponse  = {
  status: string,
  message: string,
  code: ErrorCode,
}

describe('Set\'s', () => {
  failEarly.it('should fail with 401, due no auth', async () => {
    let caughtError: AxiosError | null = null

    try {
      await frontend.loadSets()
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }

    expect(caughtError).not.toBeNull()

    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(401)
  })

  // NOTE: When I am not logged in, I will get 404 ... but if the set exists 401?
  failEarly.it('should fail, due setId does not exist', async () => {
    let caughtError: AxiosError | null = null

    try {
      await frontend.loadSet(setId)
      expect(false).toBe(true)
    } catch (error) {
      caughtError = error as AxiosError
    }

    expect(caughtError).not.toBeNull()
    if (caughtError === null) return

    expect(axios.isAxiosError(caughtError)).toBe(true)

    // TODO: to "unsafe" for a test?
    const responseErrorData = caughtError?.response?.data as ErrorResponse
    expect(responseErrorData.status).toBe('error')
    expect(responseErrorData.code).toBe(ErrorCode.SetNotFound)
    expect(caughtError?.response?.status).toBe(404)
  })
})
