import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import '../../mocks/http.js'

import { Request, Response } from 'express'
import { describe, it, expect, vi } from 'vitest'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { authRouter } from '@auth/trpc/router/auth.js'
import Auth from '@auth/domain/Auth.js'
import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'

const createCaller = createCallerFactory(authRouter)

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
  const auth = Auth.getAuth()
  const jwtIssuer = auth.getJwtIssuer()
  const refreshGuard = new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience)

  const caller = createCaller({
    auth,
    refreshGuard,
  })

  it('should login the user', async () => {
    const accessToken = 'mockAccessToken'
    const walletLinkingKey = 'walletLinkingKey'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    const lnurlAuthLogin = Auth.getAuth().getLnurlAuthLogin()

    vi.spyOn(lnurlAuthLogin, 'getWalletLinkingKeyOnceAfterSuccessfulAuth').mockReturnValueOnce(walletLinkingKey)
    vi.spyOn(refreshGuard, 'loginUserWithWalletLinkingKey').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessTokenForUser').mockResolvedValueOnce(accessToken)
    const loginResult = await caller.loginWithLnurlAuthHash({
      hash,
    })

    expect(lnurlAuthLogin.getWalletLinkingKeyOnceAfterSuccessfulAuth).toBeCalledWith(hash)
    expect(refreshGuard.loginUserWithWalletLinkingKey).toBeCalledWith(walletLinkingKey)
    expect(loginResult.accessToken).toBe(accessToken)
  })

  it('should logout the user ', async () => {
    vi.spyOn(refreshGuard, 'logout')
    vi.spyOn(mockResponse, 'clearCookie')

    await caller.logout()

    expect(refreshGuard.logout).toHaveBeenCalled()
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    )
  })

  it('should refresh RefreshToken', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'cycleRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessTokenForUser').mockResolvedValueOnce(accessToken)

    const reponse = await caller.refreshRefreshToken()

    expect(reponse.accessToken).toBe(accessToken)
    expect(refreshGuard.cycleRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.createAccessTokenForUser).toHaveBeenCalled()
  })

  it('should logout all other devices', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'cycleRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'logoutAllOtherDevices').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessTokenForUser').mockResolvedValueOnce(accessToken)
    vi.spyOn(mockResponse, 'clearCookie')

    const reponse =await caller.logoutAllOtherDevices()
    expect(reponse.accessToken).toBe(accessToken)

    expect(refreshGuard.authenticateUserViaRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.cycleRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.logoutAllOtherDevices).toHaveBeenCalled()
    expect(mockResponse.clearCookie).not.toHaveBeenCalled()
  })
})
