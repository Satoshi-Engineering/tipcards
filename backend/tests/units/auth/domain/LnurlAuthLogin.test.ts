import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import { LnurlServerMock } from '../../mocks/lnurl.js'

import { createHash } from 'crypto'
import lnurl from 'lnurl'
import { describe, vi, it, expect, beforeEach } from 'vitest'

import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import LoginInformer from '@auth/domain/LoginInformer.js'
import { type LoginEvent } from '@auth/types/LoginEvent.js'

import { delay } from '@backend/services/timingUtils.js'

describe('LnurlAuthLogin', () => {
  const loginHashExpirationTime = 100
  const lnurlServer = lnurl.createServer({ host: 'mockHost', port: 'mockPort', url: 'mockUrl' })
  let loginInformerMock: LoginInformer
  let lnurlAuthLogin: LnurlAuthLogin

  const sendLoginEvent = (event: LoginEvent) => {
    const lnurlServerMock = lnurlServer as unknown as LnurlServerMock
    return lnurlServerMock.sendLoginEvent(event)
  }

  beforeEach(() => {
    loginInformerMock = {
      waitForLogin: vi.fn(),
      emitLoginSuccessful: vi.fn(),
      emitLoginFailed: vi.fn(),
    } as unknown as LoginInformer

    lnurlAuthLogin = new LnurlAuthLogin(
      lnurlServer,
      loginInformerMock,
      loginHashExpirationTime,
    )
  })

  it('should create a hash from a secret', () => {
    const secret = 'abcdef1234567890'
    const expectedHash = createHash('sha256')
      .update(Buffer.from(secret, 'hex'))
      .digest('hex')

    const hash = LnurlAuthLogin.createHashFromSecret(secret)

    expect(hash).toBe(expectedHash)
  })

  it('should generate a new lnurl', async () => {
    const lnurlAuth = 'mockLnurlAuth'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: lnurlAuth,
      secret: secret,
    })

    const result = await lnurlAuthLogin.create()

    expect(result.lnurlAuth).toBe(lnurlAuth)
    expect(result.hash).toBe(hash)
  })

  it('should send login successful event after login event from lnurlserver', () => {
    const hash = 'mockHash'
    const walletLinkingKey = 'mockPublicKey'
    const loginEvent = { key: walletLinkingKey, hash: hash }

    sendLoginEvent(loginEvent)

    expect(loginInformerMock.emitLoginSuccessful).toHaveBeenCalledWith(hash)
  })

  it('should return walletLinkingKey after successful login', () => {
    const hash = 'mockHash'
    const walletLinkingKey = 'mockPublicKey'
    const loginEvent = { key: walletLinkingKey, hash: hash }
    sendLoginEvent(loginEvent)

    const result = lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash)

    expect(result).toBe(walletLinkingKey)
  })

  it('should return wallet linking key only once', () => {
    const hash = 'mockHash'
    const walletLinkingKey = 'mockPublicKey'
    const loginEvent = { key: walletLinkingKey, hash: hash }

    sendLoginEvent(loginEvent)
    lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash)

    expect(loginInformerMock.emitLoginSuccessful).toHaveBeenCalledWith(hash)
  })

  it('should expire one-time login hash', async () => {
    const hash = 'mockHash'
    const walletLinkingKey = 'mockPublicKey'
    const loginEvent = { key: walletLinkingKey, hash: hash }

    sendLoginEvent(loginEvent)
    await delay(loginHashExpirationTime + 1)

    expect(() => lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash)).toThrowError()
  })

  it('should remove hash on create, if it exists', async () => {
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    const walletLinkingKey = 'mockPublicKey'
    const loginEvent = { key: walletLinkingKey, hash: hash }
    sendLoginEvent(loginEvent)

    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: 'mockLnurlAuth',
      secret: secret,
    })
    await lnurlAuthLogin.create()

    expect(() => lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin(hash)).toThrowError()
  })
})
