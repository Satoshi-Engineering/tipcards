import { AxiosResponse } from 'axios'

import LNURLAuth from '../lightning/LNURLAuth'
import FrontendWithAuth from './FrontendWithAuth'
import HDWallet from '../lightning/HDWallet'

export default class FrontendSimulator extends FrontendWithAuth {
  private readonly hdWallet
  private readonly signingKey

  constructor(mnemonic = '') {
    super()
    if (mnemonic === '') {
      const randomMnemonic = HDWallet.generateRandomMnemonic()
      this.hdWallet = new HDWallet(randomMnemonic)
    } else {
      this.hdWallet = new HDWallet(mnemonic)
    }

    this.signingKey = this.hdWallet.getNodeAtPath(0, 0, 0)
  }

  async login() {
    const lnurlAuth = new LNURLAuth(this.signingKey)
    const response: AxiosResponse = await this.authCreate()
    await lnurlAuth.loginWithLNURLAuth(response.data.data.encoded)
    await this.authStatus()
  }
}
