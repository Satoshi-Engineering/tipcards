import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import { LnurlServerMock } from '../../mocks/lnurl.js'

import { createHash, randomUUID } from 'crypto'
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
  const lnurlAuthSecret = randomUUID()
  const lnurlAuthHash = LnurlAuthLogin.createHashFromSecret(lnurlAuthSecret)

  const loginHashExpirationTime = 100

  let loginInformerMock: LoginInformer
  let lnurlAuthLogin: LnurlAuthLogin

  const sendLoginEvent = (event: LoginEvent) => {
    const lnurlServerMock = lnurlServer as unknown as LnurlServerMock
    return lnurlServerMock.sendLoginEvent(event)
  }

  beforeEach(() => {
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValue({
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

  it('should create an id for a lnurlAuth', () => {
    const lnurlAuth = lnurlAuthEncoded
    const expectedId = lnurlAuthId

    const id = LnurlAuthLogin.createIdForLnurlAuth(lnurlAuth)

    expect(id).toBe(expectedId)
  })

  it('should generate a new lnurl', async () => {
    const result = await lnurlAuthLogin.create()

    expect(result).toEqual({
      id: lnurlAuthId,
      lnurlAuth: lnurlAuthEncoded,
      hash: lnurlAuthHash,
    })
  })

  it('should generate a new lnurl if no id is provided', async () => {
    const result = await lnurlAuthLogin.getOrCreate()

    expect(result).toEqual({
      id: lnurlAuthId,
      lnurlAuth: lnurlAuthEncoded,
      hash: lnurlAuthHash,
    })
  })

  it('should return different values on multiple calls', async () => {
    const result1 = await lnurlAuthLogin.getOrCreate()

    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83',
      secret: randomUUID(),
    })
    const result2 = await lnurlAuthLogin.getOrCreate()

    expect(result1.id).not.toBe(result2.id)
    expect(result1.lnurlAuth).not.toBe(result2.lnurlAuth)
    expect(result1.hash).not.toBe(result2.hash)
  })

  it('should return the previously created lnurlAuth if id is provided', async () => {
    const result1 = await lnurlAuthLogin.getOrCreate()
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83',
      secret: randomUUID(),
    })

    const result2 = await lnurlAuthLogin.getOrCreate(result1.id)

    expect(result2).toEqual(result1)
  })

  it('should return the previously created lnurlAuth if id even after login event', async () => {
    const result1 = await lnurlAuthLogin.getOrCreate()
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83',
      secret: randomUUID(),
    })
    sendLoginEvent({
      key: randomUUID(),
      hash: lnurlAuthHash,
    })

    const result2 = await lnurlAuthLogin.getOrCreate(result1.id)

    expect(result2).toEqual(result1)
  })

  it('should return a new lnurl auth after the login hash was used to retrieve the linkingKey', async () => {
    const result1 = await lnurlAuthLogin.getOrCreate()
    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83',
      secret: randomUUID(),
    })
    sendLoginEvent({
      key: randomUUID(),
      hash: lnurlAuthHash,
    })

    lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth(result1.hash)
    const result2 = await lnurlAuthLogin.getOrCreate(result1.id)

    expect(result1.id).not.toBe(result2.id)
    expect(result1.lnurlAuth).not.toBe(result2.lnurlAuth)
    expect(result1.hash).not.toBe(result2.hash)
  })

  it('should subscribe to login informer', () => {
    lnurlAuthLogin.waitForLogin(lnurlAuthHash)

    expect(loginInformerMock.waitForLogin).toHaveBeenCalledWith(lnurlAuthHash)
  })

  it('should return false on isOneTimeLoginHashValid if no login happened', () => {
    const result = lnurlAuthLogin.isOneTimeLoginHashValid(lnurlAuthHash)

    expect(result).toBe(false)
  })

  it('should return true on isOneTimeLoginHashValid if login happened', () => {
    sendLoginEvent({
      key: randomUUID(),
      hash: lnurlAuthHash,
    })

    const result = lnurlAuthLogin.isOneTimeLoginHashValid(lnurlAuthHash)

    expect(result).toBe(true)
  })

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
