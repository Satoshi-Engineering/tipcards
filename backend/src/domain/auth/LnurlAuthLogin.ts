import lnurl from 'lnurl'
import { createHash } from 'crypto'

import { LnurlAuthLoginDto } from '@shared/data/trpc/auth/LnurlAuthLoginDto.js'

import LoginInformer from './LoginInformer.js'
import { type LoginEvent } from './LoginEvent.js'

const DEFAULT_LOGINHASH_EXPIRATION_TIME = 1000 * 60 * 15

export default class LnurlAuthLogin {
  public static createHashFromSecret(secret: string): string {
    const secretBuffer = Buffer.from(secret, 'hex')
    return createHash('sha256').update(secretBuffer).digest('hex')
  }

  private lnurlServer: lnurl.LnurlServer
  private loginInformer: LoginInformer
  private oneTimeLoginWalletPublicKeys: Record<string, string> = {}
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

  private initSocketEvents() {
    this.lnurlServer.on('login', async (event: LoginEvent) => {
      // `key` - the public key as provided by the LNURL wallet app
      // `hash` - the hash of the secret for the LNURL used to login
      const { key: walletPublicKey, hash } = event
      this.addOneTimeLoginHash(hash, walletPublicKey)
      setTimeout(() => {
        this.removeOneTimeLoginHash(hash)
      }, this.loginHashExpirationTime)
      this.loginInformer.emitLoginSuccessfull(hash)
    })
  }

  private addOneTimeLoginHash(hash: string, walletPublicKey: string) {
    this.oneTimeLoginWalletPublicKeys[hash] = walletPublicKey
    this.loginInformer.addLoginHash(hash)
  }

  public invalidateLoginHash(hash: string) {
    this.removeOneTimeLoginHash(hash)
  }

  public isOneTimeLoginHashValid(hash: string): boolean {
    return hash in this.oneTimeLoginWalletPublicKeys
  }

  public getPublicKeyFromOneTimeLoginHash(hash: string): string {
    return this.oneTimeLoginWalletPublicKeys[hash]
  }

  private removeOneTimeLoginHash(hash: string) {
    delete this.oneTimeLoginWalletPublicKeys[hash]
    this.loginInformer.removeLoginHash(hash)
  }
}
