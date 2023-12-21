import axios from 'axios'

import { decodeLnurl } from '@shared/modules/lnurlHelpers'

import HDWallet from './HDWallet'
import { sign as lnurlAuthSign } from './lnurlAuth'

export default class LocalWallet {
  private hdWallet
  private signingKey

  constructor() {
    // Could be simpler to just create a public Key pair like https://medium.com/coinmonks/bitcoin-cryptography-signing-and-verifying-messages-with-node-js-645d05013f4f
    const mnemonic = HDWallet.getRandomMnemonic()
    this.hdWallet = new HDWallet(mnemonic)
    this.signingKey = this.hdWallet.getNodeAtPath(0, 0, 0)
  }

  public async loginWithLNURLAuth(lnurlAuth: string) {
    // https://github.com/lnurl/luds/blob/luds/04.md
    const urlString = decodeLnurl(lnurlAuth)
    const url = new URL(urlString)

    if (url.searchParams.get('tag')?.toLowerCase() !== 'login') {
      throw new Error('Provided lnurl auth is not for login!')
    }

    const k1 = url.searchParams.get('k1')?.toLowerCase()
    if (k1 === undefined) {
      throw new Error('Provided lnurl auth has no secret (\'parameter k1\')')
    }

    const signedK1 = lnurlAuthSign(k1, this.signingKey.getPrivateKeyAsHex())
    url.searchParams.append('sig', signedK1)
    url.searchParams.append('key', this.signingKey.getPublicKeyAsHex())
    return await axios.get(url.toString())
  }
}
