import assert from 'assert'
import lnurl from 'lnurl'
import { createHash } from 'crypto'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import LNURL from '@shared/modules/LNURL/LNURL.js'

import { LOGINHASH_EXPIRATION_TIME } from '@auth/constants.js'
import { type LoginEvent } from '@auth/types/LoginEvent.js'
import LoginInformer from '@auth/domain/LoginInformer.js'

export default class LnurlAuthLogin {
  public static createHashFromSecret(secret: string): string {
    const secretBuffer = Buffer.from(secret, 'hex')
    return createHash('sha256').update(secretBuffer).digest('hex')
  }

  public static createIdForLnurlAuth(lnurlAuth: string): string {
    const decoded = LNURL.decode(lnurlAuth)
    return decoded.split('k1=')[1]
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

  public async getOrCreate(id?: string | null): Promise<{ id: string; lnurlAuth: string; hash: string }> {
    if (
      id != null
      && this.activeLnurlsById[id] != null
    ) {
      return this.activeLnurlsById[id]
    }
    return this.create()
  }

  public async create(): Promise<{ id: string; lnurlAuth: string; hash: string }> {
    const { encoded: lnurlAuth, secret } = await this.lnurlServer.generateNewUrl('login')
    const id = LnurlAuthLogin.createIdForLnurlAuth(lnurlAuth)
    const hash = LnurlAuthLogin.createHashFromSecret(secret)

    return this.addActiveLnurl(id, lnurlAuth, hash)
  }

  public async waitForLogin(hash: string) {
    return this.loginInformer.waitForLogin(hash)
  }

  /**
   * will return the linking key (only if an auth via lightning wallet was successful) once and then clears the hash
   */
  public getWalletLinkingKeyOnceAfterSuccessfulAuth(hash: string): string {
    if (!this.isOneTimeLoginHashValid(hash)) {
      throw new ErrorWithCode('(one time) login has is not valid', ErrorCode.LnurlAuthLoginHashInvalid)
    }
    const linkingKey = this.getLinkingKeyFromOneTimeLoginHash(hash)
    this.removeOneTimeLoginHash(hash)
    return linkingKey
  }

  public isOneTimeLoginHashValid(hash: string): boolean {
    return hash in this.oneTimeLoginWalletLinkingKeys
  }

  private lnurlServer: lnurl.LnurlServer
  private loginInformer: LoginInformer
  private activeLnurlsById: Record<string, { id: string; lnurlAuth: string; hash: string }> = {}
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

  private addActiveLnurl(id: string, lnurlAuth: string, hash: string) {
    return this.activeLnurlsById[id] = { id, lnurlAuth, hash }
  }

  private addOneTimeLoginHash(hash: string, walletLinkingKey: string) {
    this.oneTimeLoginWalletLinkingKeys[hash] = walletLinkingKey
  }

  private removeOneTimeLoginHash(hash: string) {
    delete this.oneTimeLoginWalletLinkingKeys[hash]
    this.removeActiveLnurlByHash(hash)
  }

  private removeActiveLnurlByHash(hash: string) {
    const id = Object.keys(this.activeLnurlsById).find((id) => this.activeLnurlsById[id].hash === hash)
    if (id != null) {
      delete this.activeLnurlsById[id]
    }
  }

  private getLinkingKeyFromOneTimeLoginHash(hash: string): string {
    return this.oneTimeLoginWalletLinkingKeys[hash]
  }
}
