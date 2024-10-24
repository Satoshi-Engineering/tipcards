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
  const lnurlServer = lnurl.createServer({ host: 'mockHost', port: 'mockPort', url: 'mockUrl' })
  const lnurlAuthId = 'c506222e47d39be202d6ecc5e74139e2a68fab7bf5b46401c03d4d3395a4876d'
  const lnurlAuthEncoded = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e3843n2vpkxgeryef5xajrxwtzv5erqvnyxejkxce4v5mngvfn89jnycfk8pnxzc3hvfnr2c35xc6rqvtrxqekgdryxvenjdtpxsurwdnyxkdxxr'
  const lnurlAuthSecret = 'mockSecret'
  const lnurlAuthHash = LnurlAuthLogin.createHashFromSecret(lnurlAuthSecret)
  const loginHashExpirationTime = 100

  let loginInformerMock: LoginInformer
  let lnurlAuthLogin: LnurlAuthLogin

  const sendLoginEvent = (event: LoginEvent) => {
    const lnurlServerMock = lnurlServer as unknown as LnurlServerMock
    return lnurlServerMock.sendLoginEvent(event)
  }

  beforeEach(() => {
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: lnurlAuthEncoded,
      secret: lnurlAuthSecret,
    })

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
    const result = await lnurlAuthLogin.create()

    expect(result).toEqual({
      id: lnurlAuthId,
      lnurlAuth: lnurlAuthEncoded,
      hash: lnurlAuthHash,
    })
  })

  // todo : add unit tests for get or create

  // todo : add unit tests for createIdForLnurlAuth

  // todo : add unit tests for waitForLogin

  // todo : add unit tests for isOneTimeLoginHashValid

  it('should send login successful event after login event from lnurlserver', () => {
    sendLoginEvent({
      key: 'mockPublicKey',
      hash: lnurlAuthHash,
    })

    expect(loginInformerMock.emitLoginSuccessful).toHaveBeenCalledWith(lnurlAuthHash)
  })

  it('should return walletLinkingKey after successful login', () => {
    const walletLinkingKey = 'mockWalletLinkingKey'
    sendLoginEvent({
      key: walletLinkingKey,
      hash: lnurlAuthHash,
    })

    const result = lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(lnurlAuthHash)

    expect(result).toBe(walletLinkingKey)
  })

  it('should return wallet linking key only once', () => {
    sendLoginEvent({
      key: 'mockPublicKey',
      hash: lnurlAuthHash,
    })
    lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(lnurlAuthHash)

    expect(() => lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(lnurlAuthHash)).toThrowError()
  })

  it('should expire one-time login hash', async () => {
    sendLoginEvent({
      key: 'mockPublicKey',
      hash: lnurlAuthHash,
    })

    await delay(loginHashExpirationTime + 1)

    expect(() => lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(lnurlAuthHash)).toThrowError()
  })
})
