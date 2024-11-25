// Specification LNURLAuth https://github.com/lnurl/luds/blob/luds/04.md

import secp256k1 from 'secp256k1'
import { Buffer } from 'buffer'

import LNURL from './LNURL.js'

export type SigningKey = {
  privateKeyAsHex: string,
  publicKeyAsHex: string,
}

export default class LNURLAuth {
  private k1
  private signingKey: SigningKey

  constructor(signingKey: SigningKey) {
    this.signingKey = signingKey
    this.k1 = ''
  }

  public getLNURLAuthCallbackUrl(lnurlAuth: string) {
    const url = this.getLoginUrlFromLNURLAuth(lnurlAuth)

    const signedK1 = LNURLAuth.sign(this.k1, this.signingKey.privateKeyAsHex)
    url.searchParams.append('sig', signedK1)
    url.searchParams.append('key', this.signingKey.publicKeyAsHex)

    return url
  }

  getLoginUrlFromLNURLAuth(lnurlAuth: string) {
    const urlString = LNURL.decode(lnurlAuth)
    const url = new URL(urlString)

    if (url.searchParams.get('tag')?.toLowerCase() !== 'login') {
      throw new Error('Provided lnurl auth is not for login!')
    }

    const k1 = url.searchParams.get('k1')
    if (k1 == null) {
      throw new Error('Provided lnurl auth has no secret (\'parameter k1\')')
    }
    this.k1 = k1.toLowerCase()

    return url
  }

  get publicKeyAsHex() {
    return this.signingKey.publicKeyAsHex
  }

  static sign(messageAsHex: string, privateKeyAsHex: string) {
    const messageAsBuffer = Buffer.from(messageAsHex, 'hex')
    const privateKeyAsBuffer = Buffer.from(privateKeyAsHex, 'hex')
    const { signature } = secp256k1.ecdsaSign(messageAsBuffer, privateKeyAsBuffer)
    const derEncodedSignature = secp256k1.signatureExport(signature)
    return Buffer.from(derEncodedSignature).toString('hex')
  }
}
