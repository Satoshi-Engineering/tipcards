import { describe, vi, it, expect, beforeEach } from 'vitest'

import '../../mocks/process.env.js'
import '../../../lib/mocks/lnurl.js'
import { LnurlServerMock } from '../../../lib/mocks/lnurl.js'

import { createHash } from 'crypto'
import lnurl from 'lnurl'

import LnurlAuthLogin from '@backend/auth/domain/LnurlAuthLogin.js'
import LoginInformer from '@backend/auth/domain/LoginInformer.js'
import { type LoginEvent } from '@backend/auth/types/LoginEvent.js'
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
      emitLoginSuccessfull: vi.fn(),
      addLoginHash: vi.fn(),
      removeLoginHash: vi.fn(),
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
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
  })

  it('should add a one-time login hash & walletPublicKey, after login event from lnurlserver', () => {
    const hash = 'mockHash'
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }

    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
    sendLoginEvent(loginEvent)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(true)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(walletPublicKey)
  })

  it('should expire one-time login hash', async () => {
    const hash = 'mockHash'
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }

    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
    sendLoginEvent(loginEvent)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(true)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(walletPublicKey)

    await delay(loginHashExpirationTime)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
  })

  it('should remove hash on create, if it exists', async () => {
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }
    sendLoginEvent(loginEvent)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(true)

    vi.spyOn(lnurlServer, 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: 'mockLnurlAuth',
      secret: secret,
    })
    await lnurlAuthLogin.create()
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
  })

  it('should invalidate existing one time login hash', async () => {
    const hash = 'mockHash'
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }

    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
    sendLoginEvent(loginEvent)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(true)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(walletPublicKey)

    lnurlAuthLogin.invalidateLoginHash(hash)
    expect(lnurlAuthLogin.isOneTimeLoginHashValid(hash)).toBe(false)
    expect(lnurlAuthLogin.getLinkingKeyFromOneTimeLoginHash(hash)).toBe(undefined)
  })

  it('should call loginInformer.addLoginHash after addling a one-time login hash', () => {
    const hash = 'mockHash'
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }

    expect(loginInformerMock.addLoginHash).not.toHaveBeenCalled()
    sendLoginEvent(loginEvent)
    expect(loginInformerMock.addLoginHash).toHaveBeenCalledWith(hash)
  })

  it('should call loginInformer.removeLoginHash after removing a one-time login hash', () => {
    const hash = 'mockHash'
    const walletPublicKey = 'mockPublicKey'
    const loginEvent = { key: walletPublicKey, hash: hash }
    sendLoginEvent(loginEvent)

    expect(loginInformerMock.removeLoginHash).not.toHaveBeenCalled()
    lnurlAuthLogin.invalidateLoginHash(hash)
    expect(loginInformerMock.removeLoginHash).toHaveBeenCalledWith(hash)
  })
})
