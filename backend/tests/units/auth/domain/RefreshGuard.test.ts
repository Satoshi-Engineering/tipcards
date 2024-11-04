import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import {
  addData,
  allowedRefreshTokensByHash,
  allowedSessionsById,
} from '../../mocks/database/database.js'

import RefreshGuard from '@auth/domain/RefreshGuard.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'

import { uuidRegex } from '../../lib/validationUtils.js'
import { createUser, createProfileForUser, createAllowedRefreshTokensDepricated, createAllowedSession, createSessionId } from '../../../drizzleData.js'

const REFRESH_TOKEN_EXPIRATION_TIME = '28 days'
const ACCESS_TOKEN_EXPIRATION_TIME = '5 min'

const mockNonce = randomUUID()
const mockAccessTokenAudience = 'mockAccessTokenAudience'
const mockwalletLinkingKey = 'mockwalletLinkingKey'
const mockUserId = 'mockUserId'
const mockSessionId = randomUUID()
const mockUser = createUser(mockUserId)
mockUser.lnurlAuthKey = mockwalletLinkingKey
const mockProfile = createProfileForUser(mockUser)
const mockAllowedRefreshTokens = createAllowedRefreshTokensDepricated(mockUser)
const mockAllowedOtherRefreshTokens = createAllowedRefreshTokensDepricated(mockUser)
const mockAllowedSession = createAllowedSession(mockUser)
const mockRefreshToken = mockAllowedRefreshTokens.current
const mockRefreshTokenCookie = `refresh_token=${mockRefreshToken}`
const mockRequest = {
  get: vi.fn(),
  headers: {
    cookie: undefined,
    authorization: undefined,
  },
} as unknown as Request
const mockResponse = {
  cookie: vi.fn(),
  clearCookie: vi.fn(),
} as unknown as Response
const mockHost = 'domain.com'
let refreshGuard: RefreshGuard
const mockJwtIssuer = {
  createJwt: vi.fn(),
  validate: vi.fn(),
} as unknown as JwtIssuer

enum RefreshTokenFormat {
  allowedRefreshTokens,
  allowedSession,
}

// Authenticate User via Refresh Token
const setValidRefreshToken = (format: RefreshTokenFormat) => {
  vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
  mockRequest.headers.cookie = mockRefreshTokenCookie

  if (format === RefreshTokenFormat.allowedRefreshTokens) {
    const mockRefreshTokenPayload = {
      id: mockUserId,
      lnurlAuthKey: 'mockLnurlAuthKey',
      permissions: [],
      nonce: mockNonce,
    }
    vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayload)
    return
  }

  if (format === RefreshTokenFormat.allowedSession) {
    const mockRefreshTokenPayload = {
      userId: mockUserId,
      sessionId: mockSessionId,
      nonce: mockNonce,
    }
    vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayload)
    return
  }

  throw new Error('Refresh Token Format not implemented!')
}

const authUserViaRefreshToken = async (format: RefreshTokenFormat) => {
  setValidRefreshToken(format)
  await refreshGuard.authenticateUserViaRefreshToken()
}

beforeAll(() => {
  addData({
    users: [mockUser],
    profiles: [mockProfile],
    allowedSessions: [mockAllowedSession],
  })
})

describe('RefreshGuard', () => {
  beforeEach(() => {
    refreshGuard = new RefreshGuard(mockRequest, mockResponse, mockJwtIssuer, mockAccessTokenAudience)
    // Delete all allowed Refresh Tokens
    Object.keys(allowedRefreshTokensByHash).forEach(key => {
      delete allowedRefreshTokensByHash[key]
    })
    // Delete all allowed Sessions
    Object.keys(allowedSessionsById).forEach(key => {
      delete allowedSessionsById[key]
    })
    addData({
      allowedRefreshTokens: [mockAllowedRefreshTokens, mockAllowedOtherRefreshTokens],
    })
  })

  it('should create refresh token for login with walletLinkingKey ', async () => {
    const mockNewRefreshToken = 'mockNewRefreshToken'

    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockNewRefreshToken)
    await refreshGuard.loginUserWithWalletLinkingKey(mockwalletLinkingKey)

    expect(mockJwtIssuer.createJwt).toHaveBeenCalledWith(
      JWT_AUTH_ISSUER,
      REFRESH_TOKEN_EXPIRATION_TIME,
      expect.objectContaining({
        userId: mockUserId,
        sessionId: expect.stringMatching(uuidRegex),
        nonce: expect.any(String),
      }),
    )
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

  it('should fail refresh token validation due json web token is missing in cookie', async () => {
    await expect(async () => {
      await refreshGuard.authenticateUserViaRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenMissing))
  })

  it('should fail refresh token validation due host is undefined', async () => {
    mockRequest.headers.cookie = mockRefreshTokenCookie

    await expect(async () => {
      await refreshGuard.authenticateUserViaRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthHostMissingInRequest))
  })

  it('should fail refresh token validation due missing allowedRefreshTokens in database', async () => {
    const tokenGargabe = 'DIFFERENT TOKEN'
    const randomRefreshTokenCookie = `${mockRefreshTokenCookie}${tokenGargabe}`

    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    mockRequest.headers.cookie = randomRefreshTokenCookie
    const mockRefreshTokenPayload = {
      id: mockUserId,
      lnurlAuthKey: 'mockLnurlAuthKey',
      permissions: [],
      nonce: mockNonce,
    }
    vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayload)

    await expect(async () => {
      await refreshGuard.authenticateUserViaRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenDenied))
    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(`${mockRefreshToken}${tokenGargabe}`, mockHost)
  })

  it('should fail refresh token validation due missing allowedSession in database', async () => {
    const unknownSessionId = createSessionId()
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    mockRequest.headers.cookie = mockRefreshTokenCookie
    const mockRefreshTokenPayloadWithSession = {
      userId: mockUserId,
      sessionId: unknownSessionId,
      nonce: mockNonce,
    }
    vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayloadWithSession)

    await expect(async () => {
      await refreshGuard.authenticateUserViaRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenInvalid))
    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it.skip('should validate refresh json web token from cookie with allowedRefreshTokens format', async () => {
    setValidRefreshToken(RefreshTokenFormat.allowedRefreshTokens)
    await refreshGuard.authenticateUserViaRefreshToken()
    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
    expect(allowedSessionsById.length).toBe(1) // TODO: Check if one AllowedSessionId was additionally created
  })

  it.skip('should validate refresh json web token from cookie with allowedSession format', async () => {
    setValidRefreshToken(RefreshTokenFormat.allowedSession)
    await refreshGuard.authenticateUserViaRefreshToken()
    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it.skip('should fail refresh token cycling due missing user', async () => {
    await expect(async () => {
      await refreshGuard.cycleRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotAuthenticated))
  })

  it.skip('should cycle refresh token with allowedRefreshTokens format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedRefreshTokens)

    const mockNewRefreshToken = 'mockNewRefreshToken'
    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockNewRefreshToken)

    await refreshGuard.cycleRefreshToken()
    expect(mockJwtIssuer.createJwt).toHaveBeenCalledTimes(1)
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

  it.skip('should cycle refresh token with allowedSession format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedSession)

    const mockNewRefreshToken = 'mockNewRefreshToken'
    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockNewRefreshToken)

    await refreshGuard.cycleRefreshToken()
    expect(mockJwtIssuer.createJwt).toHaveBeenCalledTimes(1)
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

  it.skip('should fail authorization token creation due missing user', async () => {
    await expect(async () => {
      await refreshGuard.createAccessTokenForUser()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotAuthenticated))
  })

  it.skip('should create an new authorization token for the user with allowedRefreshTokens format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedRefreshTokens)

    const mockAuthorizationToken = 'mockAuthorizationToken'
    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockAuthorizationToken)

    const authorizationToken = await refreshGuard.createAccessTokenForUser()
    expect(authorizationToken).toBe(mockAuthorizationToken)
    expect(mockJwtIssuer.createJwt).toHaveBeenCalledWith(
      mockAccessTokenAudience,
      ACCESS_TOKEN_EXPIRATION_TIME,
      expect.objectContaining({
        id: mockUserId,
        lnurlAuthKey: mockwalletLinkingKey,
        permissions: [],
        nonce: expect.stringMatching(uuidRegex),
      }),
    )
  })

  it.skip('should create an new authorization token for the user with allowedSession format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedSession)

    const mockAuthorizationToken = 'mockAuthorizationToken'
    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockAuthorizationToken)

    const authorizationToken = await refreshGuard.createAccessTokenForUser()
    expect(authorizationToken).toBe(mockAuthorizationToken)
    expect(mockJwtIssuer.createJwt).toHaveBeenCalledWith(
      mockAccessTokenAudience,
      ACCESS_TOKEN_EXPIRATION_TIME,
      expect.objectContaining({
        id: mockUserId,
        lnurlAuthKey: mockwalletLinkingKey,
        permissions: [],
        nonce: expect.stringMatching(uuidRegex),
      }),
    )
  })

  it.skip('should fail to logoutAllOtherDevices due missing user', async () => {
    await expect(async () => {
      await refreshGuard.logoutAllOtherDevices()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotAuthenticated))
  })

  it.skip('should logoutAllOtherDevices with with allowedRefreshTokens format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedRefreshTokens)
    await refreshGuard.logoutAllOtherDevices()
    expect(allowedRefreshTokensByHash).toEqual(expect.objectContaining({
      [mockAllowedRefreshTokens.hash]: mockAllowedRefreshTokens,
    }))
  })

  it.skip('should logoutAllOtherDevices with with allowedSession format', async () => {
    await authUserViaRefreshToken(RefreshTokenFormat.allowedSession)
    await refreshGuard.logoutAllOtherDevices()
    expect(allowedRefreshTokensByHash).toEqual(expect.objectContaining({
      [mockAllowedRefreshTokens.hash]: mockAllowedRefreshTokens,
    }))
  })

  it('should clear refresh token cookie on logout with no user authenticated', async () => {
    await refreshGuard.logout()

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it.skip('should delete the allowed session on logout', async () => {
    await refreshGuard.logout()

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it.skip('should delete the refresh token from allowed refresh tokens on logout', async () => {
    await refreshGuard.logout()

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })
})
