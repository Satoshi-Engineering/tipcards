import { AxiosResponse } from 'axios'

import LNURLAuth from '../lightning/LNURLAuth'
import FrontendWithAuth from './FrontendWithAuth'

export default class FrontendSimulator extends FrontendWithAuth {
  async login() {
    const lnurlAuth = new LNURLAuth()
    const response: AxiosResponse = await this.authCreate()
    await lnurlAuth.loginWithLNURLAuth(response.data.data.encoded)
    await this.authStatus()
  }
}
