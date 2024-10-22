import assert from 'assert'
import lnurl from 'lnurl'
import { createHash } from 'crypto'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import { LOGINHASH_EXPIRATION_TIME } from '@auth/constants.js'
import { type LoginEvent } from '@auth/types/LoginEvent.js'
import LoginInformer from '@auth/domain/LoginInformer.js'

export default class LnurlAuthLogin {
  public static createHashFromSecret(secret: string): string {
    const secretBuffer = Buffer.from(secret, 'hex')
    return createHash('sha256').update(secretBuffer).digest('hex')
  }

  constructor(
    lnurlServer: lnurl.LnurlServer,
    loginInformer: LoginInformer,
    loginHashExpirationTime = LOGINHASH_EXPIRATION_TIME,
  ) {
    this.lnurlServer = lnurlServer
    this.loginInformer = loginInformer
    this.loginHashExpirationTime = loginHashExpirationTime

    this.initLnurlServer()
  }

  public async create() {
    const { encoded: lnurlAuth, secret } = await this.lnurlServer.generateNewUrl('login')
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    this.removeOneTimeLoginHash(hash)

    return {
      lnurlAuth,
      hash,
    }
  }

  public async waitForLogin(hash: string) {
    return this.loginInformer.waitForLogin(hash)
  }

  public getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash: string): string {
    if (!this.isOneTimeLoginHashValid(hash)) {
      throw new ErrorWithCode('(one time) login has is not valid', ErrorCode.LnurlAuthLoginHashInvalid)
    }
    const linkingKey = this.getLinkingKeyFromOneTimeLoginHash(hash)
    this.removeOneTimeLoginHash(hash)
    return linkingKey
  }

  private lnurlServer: lnurl.LnurlServer
  private loginInformer: LoginInformer
  private oneTimeLoginWalletLinkingKeys: Record<string, string> = {}
  private loginHashExpirationTime: number

  private initLnurlServer() {
    this.lnurlServer.on('login', async (event: LoginEvent) => {
      // `key` - the public key as provided by the LNURL wallet app
      // `hash` - the hash of the secret for the LNURL used to login
      const { key: walletLinkingKey, hash } = event
      assert(walletLinkingKey.length > 0, 'lnurlServer.on(login) - Wallet linking key is empty')
      this.addOneTimeLoginHash(hash, walletLinkingKey)
      setTimeout(() => {
        this.removeOneTimeLoginHash(hash)
      }, this.loginHashExpirationTime)
      this.loginInformer.emitLoginSuccessful(hash)
    })
  }

  private addOneTimeLoginHash(hash: string, walletLinkingKey: string) {
    this.oneTimeLoginWalletLinkingKeys[hash] = walletLinkingKey
  }

  private isOneTimeLoginHashValid(hash: string): boolean {
    return hash in this.oneTimeLoginWalletLinkingKeys
  }

  private removeOneTimeLoginHash(hash: string) {
    delete this.oneTimeLoginWalletLinkingKeys[hash]
  }

  private getLinkingKeyFromOneTimeLoginHash(hash: string): string {
    return this.oneTimeLoginWalletLinkingKeys[hash]
  }
}
