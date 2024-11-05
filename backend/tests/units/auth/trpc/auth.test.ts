import { describe, it, expect, vi, afterEach } from 'vitest'

import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import '../../mocks/http.js'

import { Request, Response } from 'express'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { authRouter } from '@auth/trpc/router/auth.js'
import Auth from '@auth/domain/Auth.js'
import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'
import AuthenticatedUser from '@auth/domain/AuthenticatedUser.js'
import {
  deleteRefreshTokenInDatabase,
  deleteAllRefreshTokensInDatabase,
} from '@auth/domain/allowedRefreshTokensHelperFunctions.js'

const createCaller = createCallerFactory(authRouter)

vi.mock(import('@auth/domain/allowedRefreshTokensHelperFunctions.js'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    deleteAllRefreshTokensInDatabase: vi.fn(),
    deleteRefreshTokenInDatabase: vi.fn(),
  }
})

describe('TRpc Router Auth', async () => {
  const mockAccessTokenAudience = 'mockAccessTokenIssuer'
  const mockRequest = {
    cookie: vi.fn(),
  } as unknown as Request
  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response

  await Auth.init(mockAccessTokenAudience)
  const auth = Auth.instance
  const jwtIssuer = auth.jwtIssuer
  const refreshGuard = new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience)
  const authenticatedUser  = {
    setNewRefreshTokenCookie: vi.fn(),
    createAccessToken: vi.fn(),
    logout: vi.fn(),
    logoutAllOtherDevices: vi.fn(),
  } as unknown as AuthenticatedUser

  const caller = createCaller({
    auth,
    refreshGuard,
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should login the user', async () => {
    const accessToken = 'mockAccessToken'
    const walletLinkingKey = 'walletLinkingKey'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    const lnurlAuthLogin = Auth.instance.lnurlAuthLogin

    vi.spyOn(lnurlAuthLogin, 'getWalletLinkingKeyOnceAfterSuccessfulAuth').mockReturnValueOnce(walletLinkingKey)
    vi.spyOn(refreshGuard, 'loginUserWithWalletLinkingKey').mockResolvedValueOnce(authenticatedUser)
    vi.spyOn(authenticatedUser, 'setNewRefreshTokenCookie').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'createAccessToken').mockResolvedValueOnce(accessToken)
    const loginResult = await caller.loginWithLnurlAuthHash({
      hash,
    })

    expect(lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth).toBeCalledWith(hash)
    expect(refreshGuard.loginUserWithWalletLinkingKey).toBeCalledWith(walletLinkingKey)
    expect(loginResult.accessToken).toBe(accessToken)
  })

  it('should refresh RefreshToken', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce(authenticatedUser)
    vi.spyOn(authenticatedUser, 'setNewRefreshTokenCookie').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'createAccessToken').mockResolvedValueOnce(accessToken)

    const reponse = await caller.refreshRefreshToken()

    expect(reponse.accessToken).toBe(accessToken)
    expect(authenticatedUser.setNewRefreshTokenCookie).toHaveBeenCalled()
    expect(authenticatedUser.createAccessToken).toHaveBeenCalled()
  })

  it('should logout the user without a authenticated user', async () => {
    vi.spyOn(mockResponse, 'clearCookie')

    await caller.logout()

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    )
  })

  it('should logout the user with a authenticated user', async () => {
    vi.spyOn(mockResponse, 'clearCookie')
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce(authenticatedUser)
    vi.spyOn(authenticatedUser, 'logout').mockResolvedValueOnce()

    await caller.logout()

    expect(authenticatedUser.logout).toHaveBeenCalled()
  })

  it('should call deleteRefreshTokenInDatabase on logout', async () => {
    const mockRefreshToken = 'mockRefreshToken'
    vi.spyOn(refreshGuard, 'getRefreshTokenFromRequestCookies').mockReturnValueOnce(mockRefreshToken)

    await caller.logout()

    expect(refreshGuard.getRefreshTokenFromRequestCookies).toHaveBeenCalledOnce()
    expect(deleteRefreshTokenInDatabase).toHaveBeenCalledWith(mockRefreshToken)
  })

  it('should logout all other devices', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce(authenticatedUser)
    vi.spyOn(authenticatedUser, 'setNewRefreshTokenCookie').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'logoutAllOtherDevices').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'createAccessToken').mockResolvedValueOnce(accessToken)
    vi.spyOn(mockResponse, 'clearCookie')

    const reponse = await caller.logoutAllOtherDevices()

    expect(reponse.accessToken).toBe(accessToken)
    expect(refreshGuard.authenticateUserViaRefreshToken).toHaveBeenCalled()
    expect(authenticatedUser.setNewRefreshTokenCookie).toHaveBeenCalled()
    expect(authenticatedUser.logoutAllOtherDevices).toHaveBeenCalled()
    expect(authenticatedUser.createAccessToken).toHaveBeenCalled()
    expect(mockResponse.clearCookie).not.toHaveBeenCalled()
  })

  it('should call deleteAllRefreshTokensInDatabase on logout all other devices', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce(authenticatedUser)
    vi.spyOn(authenticatedUser, 'setNewRefreshTokenCookie').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'logoutAllOtherDevices').mockResolvedValueOnce()
    vi.spyOn(authenticatedUser, 'createAccessToken').mockResolvedValueOnce(accessToken)
    vi.spyOn(mockResponse, 'clearCookie')

    await caller.logoutAllOtherDevices()

    expect(deleteAllRefreshTokensInDatabase).toHaveBeenCalledWith(authenticatedUser.userId)
  })
})
