import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import { queries } from '../../mocks/database/client.js'
import {
  addData,
  allowedSessionsById,
} from '../../mocks/database/database.js'

import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import RefreshGuard from '@auth/domain/RefreshGuard.js'
import AuthenticatedUser from '@auth/domain/AuthenticatedUser.js'
import hashSha256 from '@backend/services/hashSha256.js'

import {
  createUser,
  createProfileForUser,
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
const mockAllowedSession = createAllowedSession(mockUser)
const mockSessionId = mockAllowedSession.sessionId
const mockRefreshToken = hashSha256(randomUUID())
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

// Authenticate User via Refresh Token
const setValidRefreshToken = () => {
  vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
  mockRequest.headers.cookie = mockRefreshTokenCookie

  const mockRefreshTokenPayload = {
    userId: mockUserId,
    sessionId: mockSessionId,
    nonce: mockNonce,
  }
  vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayload)
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
    // Delete all allowed Sessions
    Object.keys(allowedSessionsById).forEach(key => {
      delete allowedSessionsById[key]
    })
    addData({
      allowedSessions: [mockAllowedSession],
    })
  })

  it('should fail login with walletLinkingKey, due to a database error', async () => {
    vi.spyOn(queries, 'getUserByLnurlAuthKey').mockRejectedValueOnce(new Error('Database Error'))
    await expect(refreshGuard.loginUserWithWalletLinkingKey(mockwalletLinkingKey))
      .rejects.toThrowError(new ErrorWithCode(Error('Database Error'), ErrorCode.UnableToGetOrCreateUserByLnurlAuthKey))
  })

  it('should create authenticated user for wallet linking key ', async () => {
    const authenticatedUser = await refreshGuard.loginUserWithWalletLinkingKey(mockwalletLinkingKey)
    expect(authenticatedUser).toBeInstanceOf(AuthenticatedUser)
  })

  it('should fail refresh token validation, if json web token is missing in cookie', async () => {
    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('Refresh token missing in request cookie', ErrorCode.RefreshTokenMissing))
  })

  it('should fail refresh token validation, if host is undefined', async () => {
    mockRequest.headers.cookie = mockRefreshTokenCookie

    await expect(refreshGuard.authenticateUserViaRefreshToken())
      .rejects.toThrowError(new ErrorWithCode('Host missing in Request', ErrorCode.AuthHostMissingInRequest))
  })

  it('should fail refresh token validation, the allowedSession is missing in database', async () => {
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
      .rejects.toThrowError(new ErrorWithCode('SessionId not found in database', ErrorCode.RefreshTokenDenied))

    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it('should validate refresh json web token from cookie with allowedSession format', async () => {
    const allowedSessionsForUserCount = getAllowedSessionForUserId(mockUserId).length
    setValidRefreshToken()

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
