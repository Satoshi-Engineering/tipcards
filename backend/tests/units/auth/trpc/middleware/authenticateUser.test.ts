import { describe, it, expect, vi, afterEach } from 'vitest'
import { Request, Response } from 'express'

import '../../../mocks/process.env.js'
import '../../../mocks/lnurl.js'
import '../../../mocks/http.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { authRouter } from '@auth/trpc/router/auth.js'
import Auth from '@auth/domain/Auth.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'

const createCaller = createCallerFactory(authRouter)

let mockRequest: Request
let mockResponse: Response
let refreshGuard: RefreshGuard
let caller: ReturnType<typeof createCaller>

// Note: Because a trpc middleware is not direct callable, this test uses the refreshRefreshToken route which uses
// the authenticatedUser which uses the authenticateUser middleware.
describe('authenticateUser', async () => {
  const mockAccessTokenAudience = 'mockAccessTokenIssuer'
  mockRequest = {
    cookie: vi.fn(),
  } as unknown as Request
  mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response

  await Auth.init(mockAccessTokenAudience)
  const auth = Auth.instance
  const jwtIssuer = auth.jwtIssuer
  refreshGuard = new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience)

  caller = createCaller({
    auth,
    refreshGuard,
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should clear cookie on RefreshTokenExpired', async () => {
    await shouldClearCookieOnErrorCode(ErrorCode.RefreshTokenExpired)
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    )
  })

  it('should clear cookie on RefreshTokenDenied', async () => {
    await shouldClearCookieOnErrorCode(ErrorCode.RefreshTokenDenied)
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
    )
  })

  it('should not clear cookie on UnknownDatabaseError', async () => {
    await shouldClearCookieOnErrorCode(ErrorCode.UnknownDatabaseError)
    expect(mockResponse.clearCookie).not.toBeCalled()
  })

  it('should not clear cookie on AuthHostMissingInRequest', async () => {
    await shouldClearCookieOnErrorCode(ErrorCode.AuthHostMissingInRequest)
    expect(mockResponse.clearCookie).not.toBeCalled()
  })

  it('should not clear cookie on Error', async () => {
    vi.spyOn(mockResponse, 'clearCookie')
    vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockRejectedValueOnce(new Error('random error'))

    await expect(caller.refreshRefreshToken()).rejects.toThrowError()

    expect(mockResponse.clearCookie).not.toBeCalled()
  })
})

const shouldClearCookieOnErrorCode = async (errorCode: ErrorCode) => {
  vi.spyOn(mockResponse, 'clearCookie')
  vi.spyOn(refreshGuard, 'authenticateUserViaRefreshToken').mockRejectedValueOnce(new ErrorWithCode('', errorCode))

  await expect(caller.refreshRefreshToken()).rejects.toThrowError()
}
