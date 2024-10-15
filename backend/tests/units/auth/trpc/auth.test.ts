import '@backend/initEnv.js' // Info: .env needs to read before imports

import '../../../lib/mocks/lnurl.js'
import '../../../lib/mocks/socketIo.js'
import '../../../lib/mocks/http.js'

import { describe, it, expect, vi } from 'vitest'
import http from 'http'
import { Request, Response } from 'express'

import { createCallerFactory } from '@backend/auth/trpc/trpc.js'

import '../../../integration/lib/initAxios.js'
import { authRouter } from '@backend/auth/trpc/router/auth.js'
import SocketIoServer from '@backend/auth/services/SocketIoServer.js'
import Auth from '@backend/auth/domain/Auth.js'
import LnurlServer from '@backend/auth/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/auth/domain/LnurlAuthLogin.js'
import RefreshGuard from '@backend/auth/domain/RefreshGuard.js'

const createCaller = createCallerFactory(authRouter)

describe('TRpc Router Auth', () => {
  const mockRequest = {
    cookie: vi.fn(),
  } as unknown as Request
  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response

  const server = new http.Server()
  LnurlServer.init()
  SocketIoServer.init(server)
  Auth.init()

  const refreshGuard = new RefreshGuard(mockRequest, mockResponse)

  const caller = createCaller({
    auth: Auth.getAuth(),
    refreshGuard,
  })

  it('should login the user', async () => {
    const accessToken = 'mockAccessToken'
    const walletLinkingKey = 'walletLinkingKey'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    const lnurlAuthLogin = Auth.getAuth().getLnurlAuthLogin()

    vi.spyOn(lnurlAuthLogin, 'getWalletLinkingKeyAfterSuccessfulOneTimeLogin').mockReturnValueOnce(walletLinkingKey)
    vi.spyOn(refreshGuard, 'loginWithWalletLinkingKey').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessToken').mockResolvedValueOnce(accessToken)
    const loginResult = await caller.loginWithLnurlAuthHash({
      hash,
    })

    expect(lnurlAuthLogin.getWalletLinkingKeyAfterSuccessfulOneTimeLogin).toBeCalledWith(hash)
    expect(refreshGuard.loginWithWalletLinkingKey).toBeCalledWith(walletLinkingKey)
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
    vi.spyOn(refreshGuard, 'validateRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'cycleRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessToken').mockResolvedValueOnce(accessToken)

    const reponse = await caller.refreshRefreshToken()

    expect(reponse.accessToken).toBe(accessToken)
    expect(refreshGuard.cycleRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.createAccessToken).toHaveBeenCalled()
  })

  it('should logout all other devices', async () => {
    const accessToken = 'mockAccessToken'
    vi.spyOn(refreshGuard, 'validateRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'cycleRefreshToken').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'logoutAllOtherDevices').mockResolvedValueOnce()
    vi.spyOn(refreshGuard, 'createAccessToken').mockResolvedValueOnce(accessToken)
    vi.spyOn(mockResponse, 'clearCookie')

    const reponse =await caller.logoutAllOtherDevices()
    expect(reponse.accessToken).toBe(accessToken)

    expect(refreshGuard.validateRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.cycleRefreshToken).toHaveBeenCalled()
    expect(refreshGuard.logoutAllOtherDevices).toHaveBeenCalled()
    expect(mockResponse.clearCookie).not.toHaveBeenCalled()
  })
})
