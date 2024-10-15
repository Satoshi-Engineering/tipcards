import assert from 'assert'
import lnurl from 'lnurl'
import { createHash } from 'crypto'

import { LnurlAuthLoginDto } from '@auth/data/trpc/LnurlAuthLoginDto.js'

import LoginInformer from './LoginInformer.js'
import { type LoginEvent } from '../types/LoginEvent.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

const DEFAULT_LOGINHASH_EXPIRATION_TIME = 1000 * 60 * 15

export default class LnurlAuthLogin {
  public static createHashFromSecret(secret: string): string {
    const secretBuffer = Buffer.from(secret, 'hex')
    return createHash('sha256').update(secretBuffer).digest('hex')
  }

  private lnurlServer: lnurl.LnurlServer
  private loginInformer: LoginInformer
  private oneTimeLoginWalletLinkingKeys: Record<string, string> = {}
  private loginHashExpirationTime: number

  constructor(
    lnurlServer: lnurl.LnurlServer,
    loginInformer: LoginInformer,
    loginHashExpirationTime = DEFAULT_LOGINHASH_EXPIRATION_TIME,
  ) {
    this.lnurlServer = lnurlServer
    this.loginInformer = loginInformer
    this.loginHashExpirationTime = loginHashExpirationTime
    this.initSocketEvents()
  }

  public async create(): Promise<LnurlAuthLoginDto> {
    const { encoded: lnurlAuth, secret } = await this.lnurlServer.generateNewUrl('login')
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    this.removeOneTimeLoginHash(hash)

    return {
      lnurlAuth,
      hash,
    }
  }

  public getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash: string): string {
    if (!this.isOneTimeLoginHashValid(hash)) {
      throw new ErrorWithCode('(one time) login has is not valid', ErrorCode.LnurlAuthLoginHashInvaid)
    }
    const linkingKey = this.getLinkingKeyFromOneTimeLoginHash(hash)
    this.invalidateLoginHash(hash)
    return linkingKey
  }

  private initSocketEvents() {
    this.lnurlServer.on('login', async (event: LoginEvent) => {
      // `key` - the public key as provided by the LNURL wallet app
      // `hash` - the hash of the secret for the LNURL used to login
      const { key: walletLinkingKey, hash } = event
      assert(walletLinkingKey.length > 0, 'lnurlServer.on(login) - Wallet linking key is empty')
      this.addOneTimeLoginHash(hash, walletLinkingKey)
      setTimeout(() => {
        this.removeOneTimeLoginHash(hash)
      }, this.loginHashExpirationTime)
      this.loginInformer.emitLoginSuccessfull(hash)
    })
  }

  private addOneTimeLoginHash(hash: string, walletLinkingKey: string) {
    this.oneTimeLoginWalletLinkingKeys[hash] = walletLinkingKey
    this.loginInformer.addLoginHash(hash)
  }

  public invalidateLoginHash(hash: string) {
    this.removeOneTimeLoginHash(hash)
  }

  public isOneTimeLoginHashValid(hash: string): boolean {
    return hash in this.oneTimeLoginWalletLinkingKeys
  }

  public getLinkingKeyFromOneTimeLoginHash(hash: string): string {
    return this.oneTimeLoginWalletLinkingKeys[hash]
  }

  private removeOneTimeLoginHash(hash: string) {
    delete this.oneTimeLoginWalletLinkingKeys[hash]
    this.loginInformer.removeLoginHash(hash)
  }
}
