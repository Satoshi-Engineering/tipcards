import axios from 'axios'

import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import HDWallet from '@shared/modules/HDWallet/HDWallet.js'

import FrontendWithAuth from './FrontendWithAuth.js'

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
    const lnurlAuth = new LNURLAuth({
      publicKeyAsHex: this.signingKey.getPublicKeyAsHex(),
      privateKeyAsHex: this.signingKey.getPrivateKeyAsHex(),
    })
    const response = await this.authCreateLnUrlAuth()
    const callbackUrl = lnurlAuth.getLNURLAuthCallbackUrl(response.lnurlAuth)
    await axios.get(callbackUrl.toString())
    await this.authLoginWithLnurlAuthHash()
  }
}
