import '../initEnv'
import {  AxiosResponse } from 'axios'

import LNBitsWallet from '../lightning/LNBitsWallet'
import FailEarly from '../../FailEarly'
import Frontend from '../Frontend'

const wallet = new LNBitsWallet(process.env.LNBITS_ORIGIN || '', process.env.LNBITS_ADMIN_KEY || '')
const failEarly = new FailEarly(it)
const frontend = new Frontend()

describe('auth', () => {
  failEarly.it('should fail with 401, due no login', async () => {
    let response: AxiosResponse | null = null

    try {
      response = await frontend.authRefresh()
    } catch (error) {
      console.error(error)
      expect(false).toBe(true)
      return
    }

    expect(response).toBeNull()
  })

})
