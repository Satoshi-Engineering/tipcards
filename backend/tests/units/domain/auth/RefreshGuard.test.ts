import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import { addData } from '../../mocks/database/database.js'

import { validateJwt, createRefreshToken, createAccessToken } from '@backend/services/jwt.js'
import RefreshGuard from '@backend/domain/auth/RefreshGuard.js'
import { AuthErrorCodes } from '@backend/domain/auth/types/AuthErrorCodes.js'

import { createUser, createProfileForUser, createAllowedRefreshTokens } from '../../../drizzleData.js'

const mockWalletPublicKey = 'mockWalletPublicKey'
const mockUserId = 'mockUserId'
const mockUser = createUser(mockUserId)
mockUser.lnurlAuthKey = mockWalletPublicKey
const mockProfile = createProfileForUser(mockUser)
const mockAllowedRefreshTokens = createAllowedRefreshTokens(mockUser)
const mockRefreshToken = mockAllowedRefreshTokens.current

beforeAll(() => {
  addData({
    users: [mockUser],
    profiles: [mockProfile],
    allowedRefreshTokens: [mockAllowedRefreshTokens],
  })
})

describe('RefreshGuard', () => {
  let refreshGuard: RefreshGuard

  const mockRequest = {
    cookies: {
      refresh_token: undefined,
    },
    get: vi.fn(),
    headers: {
      authorization: undefined,
    },
  } as unknown as Request
  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response
  const mockHost = 'domain.com'

  beforeEach(() => {
    refreshGuard = new RefreshGuard(mockRequest, mockResponse)
  })

  it('should create refresh token for login with walletPublicKey ', async () => {
    const mockNewRefreshToken = 'mockNewRefreshToken'
    const mockNewAccessToken = 'mockNewAccessToken'
    vi.mocked(createRefreshToken).mockResolvedValueOnce(mockNewRefreshToken)
    vi.mocked(createAccessToken).mockResolvedValueOnce(mockNewAccessToken)

    await refreshGuard.loginWithWalletPublicKey(mockWalletPublicKey)

    expect(createRefreshToken).toHaveBeenCalledOnce()
    expect(createAccessToken).toHaveBeenCalledOnce()
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      mockNewRefreshToken,
      {
        expires: expect.any(Date),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it('clear refresh token cookie on logout', async () => {
    refreshGuard.logout()
    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it('should fail refresh token validation due host is undefined', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(undefined)

    await expect(async () => {
      await refreshGuard.validateRefreshToken()
    }).rejects.toThrowError(new Error(AuthErrorCodes.HOST_MISSING))
  })

  it('should fail refresh token validation due json web token is missing in cookie', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)

    await expect(async () => {
      await refreshGuard.validateRefreshToken()
    }).rejects.toThrowError(new Error(AuthErrorCodes.REFRESH_TOKEN_MISSING))
  })

  it('should fail refresh token validation due missing entry in database', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    const randomToken = `${mockRefreshToken} - DIFFERENT TOKEN`
    mockRequest.cookies.refresh_token = randomToken

    const mockRefreshTokenPayload = {
      id: 'mockUserId',
      lnurlAuthKey: 'mockLnurlAuthKey',
      permissions: [],
      nonce: 'mockNonce',
    }
    vi.mocked(validateJwt).mockResolvedValueOnce(mockRefreshTokenPayload)

    await expect(async () => {
      await refreshGuard.validateRefreshToken()
    }).rejects.toThrowError(new Error(AuthErrorCodes.REFRESH_TOKEN_DENIED))
    expect(validateJwt).toHaveBeenCalledWith(randomToken, mockHost)
  })

  it('should validate refresh json web token from cookie', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    mockRequest.cookies.refresh_token = mockRefreshToken

    const mockRefreshTokenPayload = {
      id: mockUserId,
      lnurlAuthKey: 'mockLnurlAuthKey',
      permissions: [],
      nonce: 'mockNonce',
    }
    vi.mocked(validateJwt).mockResolvedValueOnce(mockRefreshTokenPayload)

    await refreshGuard.validateRefreshToken()
    expect(validateJwt).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })
})
