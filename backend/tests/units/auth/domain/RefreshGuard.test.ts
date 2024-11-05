import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import { queries } from '../../mocks/database/client.js'
import {
  addData,
  allowedRefreshTokensByHash,
  allowedSessionsById,
} from '../../mocks/database/database.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import RefreshGuard from '@auth/domain/RefreshGuard.js'
import AuthenticatedUser from '@auth/domain/AuthenticatedUser.js'

import {
  createUser,
  createProfileForUser,
  createAllowedRefreshTokensDepricated,
  createAllowedSession,
  createSessionId,
} from '../../../drizzleData.js'

const mockNonce = randomUUID()
const mockAccessTokenAudience = 'mockAccessTokenAudience'
const mockwalletLinkingKey = 'mockwalletLinkingKey'
const mockUserId = 'mockUserId'
const mockUser = createUser(mockUserId)
mockUser.lnurlAuthKey = mockwalletLinkingKey
const mockProfile = createProfileForUser(mockUser)
const mockAllowedRefreshTokens = createAllowedRefreshTokensDepricated(mockUser)
const mockAllowedOtherRefreshTokens = createAllowedRefreshTokensDepricated(mockUser)
const mockAllowedSession = createAllowedSession(mockUser)
const mockSessionId = mockAllowedSession.sessionId
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
      allowedSessions: [mockAllowedSession],
    })
  })

  it('should fail login with walletLinkingKey due database error', async () => {
    vi.spyOn(queries, 'getUserByLnurlAuthKey').mockRejectedValueOnce(new Error('Database Error'))
    await expect(refreshGuard.loginUserWithWalletLinkingKey(mockwalletLinkingKey))
      .rejects.toThrowError(new ErrorWithCode('', ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey))
  })

  it('should create authenticated user for wallet linking key ', async () => {
    const authenticatedUser = await refreshGuard.loginUserWithWalletLinkingKey(mockwalletLinkingKey)
    expect(authenticatedUser).toBeInstanceOf(AuthenticatedUser)
  })

  it('should fail refresh token validation due json web token is missing in cookie', async () => {
    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenMissing))
  })

  it('should fail refresh token validation due host is undefined', async () => {
    mockRequest.headers.cookie = mockRefreshTokenCookie

    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthHostMissingInRequest))
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

    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenDenied))

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

    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenDenied))

    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it('should validate refresh json web token from cookie with allowedRefreshTokens format', async () => {
    const allowedSessionsForUserCount = getAllowedSessionForUserId(mockUserId).length
    setValidRefreshToken(RefreshTokenFormat.allowedRefreshTokens)

    const authenticatedUser = await refreshGuard.authenticateUserViaRefreshToken()

    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
    expect(getAllowedSessionForUserId(authenticatedUser.userId).length).toBe(allowedSessionsForUserCount + 1)
  })

  it('should validate refresh json web token from cookie with allowedSession format', async () => {
    const allowedSessionsForUserCount = getAllowedSessionForUserId(mockUserId).length
    setValidRefreshToken(RefreshTokenFormat.allowedSession)

    const authenticatedUser = await refreshGuard.authenticateUserViaRefreshToken()

    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
    expect(getAllowedSessionForUserId(authenticatedUser.userId).length).toBe(allowedSessionsForUserCount)
  })
})

const getAllowedSessionForUserId = (userId: string) => {
  return Object.keys(allowedSessionsById).filter((sessionId) =>
    allowedSessionsById[sessionId].user === userId,
  )
}
