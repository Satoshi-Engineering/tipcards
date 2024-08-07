import axios, { AxiosResponse } from 'axios'
import { io, Socket } from 'socket.io-client'

import LNURLAuth from '@shared/modules/LNURL/LNURLAuth.js'
import { retryFunctionWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/timingUtils.js'

import FrontendWithAuth from './FrontendWithAuth.js'
import HDWallet from '../HDWallet/HDWallet.js'
import { API_ORIGIN } from '../constants.js'

export default class FrontendSimulator extends FrontendWithAuth {
  private readonly hdWallet
  private readonly signingKey

  private socket: Socket | null = null
  private lastSocketError: Error | null = null
  private socketLoggedInEventRecieved = false

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
    const response: AxiosResponse = await this.authCreate()
    const callbackUrl = lnurlAuth.getLNURLAuthCallbackUrl(response.data.data.encoded)
    await axios.get(callbackUrl.toString())
    await this.authStatus()
  }

  async initSocketConnectionWithBackend() {
    this.socketLoggedInEventRecieved = false
    this.lastSocketError = null

    this.socket = io(API_ORIGIN as string)
    if (this.socket === null) {
      throw Error('socket should be an instance')
    }

    this.socket.on('error', (error) => {
      this.lastSocketError = error
    })
    this.socket.on('loggedIn', async () => {
      this.socketLoggedInEventRecieved = true
    })

    await this.waitUntilSocketConnectionIsEstablished()
  }

  emitSocketEventWaitForLogin(hash: string) {
    if (this.socket === null) {
      throw Error('socket should be an instance')
    }
    this.socket.emit('waitForLogin', { hash })
  }

  async waitUntilSocketConnectionIsEstablished() {
    await retryFunctionWithDelayUntilSuccessWithMaxAttempts( () => {
      if (this.socket === null) {
        throw Error('socket should be an instance')
      }
      return this.socket.connected
    }, 20)
  }

  hasSocketConnection() {
    return this.socket !== null && this.socket.connected
  }

  getLastSocketError() {
    return this.lastSocketError
  }

  hasLoggedInEventRecieved() {
    return this.socketLoggedInEventRecieved
  }

  deinitSocketConnection() {
    if (this.socket !== null) {
      this.socket.close()
    }
  }
}
