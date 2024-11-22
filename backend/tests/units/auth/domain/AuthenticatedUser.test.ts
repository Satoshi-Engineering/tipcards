import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Response } from 'express'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import {
  addData,
  allowedSessionsById,
} from '../../mocks/database/database.js'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'
import User from '@backend/domain/User.js'

import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import AllowedSession from '@auth/domain/AllowedSession.js'
import AuthenticatedUser from '@auth/domain/AuthenticatedUser.js'
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from '@auth/constants.js'

import { uuidRegex } from '../../lib/validationUtils.js'
import { createAllowedSession } from '../../../drizzleData.js'

const mockAccessTokenAudience = 'mockAccessTokenAudience'
const mockWalletLinkingKey = 'mockWalletLinkingKey'

const user = User.newUserFromWalletLinkingKey(mockWalletLinkingKey)
let authenticatedUser: AuthenticatedUser
const allowedSession = AllowedSession.createNewForUserId(user.id)
const allowedOtherSessionsInDatabase = Array.from({ length: 10 }, () => createAllowedSession(user))

const mockResponse = {
  cookie: vi.fn(),
  clearCookie: vi.fn(),
} as unknown as Response
const mockJwtIssuer = {
  createJwt: vi.fn(),
  validate: vi.fn(),
} as unknown as JwtIssuer

beforeAll(async () => {
  await user.insert()
})

describe('Authenticed User', () => {
  beforeEach(async () => {

    authenticatedUser = new AuthenticatedUser({
      user,
      allowedSession: allowedSession,
      response: mockResponse,
      jwtIssuer: mockJwtIssuer,
      jwtAccessTokenAudience: mockAccessTokenAudience,
    })
    // Delete all allowed Sessions
    Object.keys(allowedSessionsById).forEach(key => {
      delete allowedSessionsById[key]
    })
    // Add Data
    await allowedSession.insert()
    addData({
      allowedSessions: allowedOtherSessionsInDatabase,
    })
  })

  it('should set a new refresh token in response', async () => {
    const mockNewRefreshToken = 'mockNewRefreshToken'

    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockNewRefreshToken)
    await authenticatedUser.setNewRefreshTokenCookie()

    expect(mockJwtIssuer.createJwt).toHaveBeenCalledWith(
      JWT_AUTH_ISSUER,
      REFRESH_TOKEN_EXPIRATION_TIME,
      expect.objectContaining({
        userId: user.id,
        sessionId: allowedSession.sessionId,
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

  it('should create an new authorization token', async () => {
    const mockAuthorizationToken = 'mockAuthorizationToken'
    vi.spyOn(mockJwtIssuer, 'createJwt').mockResolvedValueOnce(mockAuthorizationToken)

    const authorizationToken = await authenticatedUser.createAccessToken()

    expect(authorizationToken).toBe(mockAuthorizationToken)
    expect(mockJwtIssuer.createJwt).toHaveBeenCalledWith(
      mockAccessTokenAudience,
      ACCESS_TOKEN_EXPIRATION_TIME,
      expect.objectContaining({
        userId: user.id,
        permissions: user.permissions,
        nonce: expect.stringMatching(uuidRegex),
      }),
    )
  })

  it('should clear refresh token cookie on logout', async () => {
    await authenticatedUser.logout()

    expect(mockResponse.clearCookie).toHaveBeenCalledWith(
      'refresh_token',
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it('should delete allowed Session on logout', async () => {
    expect(allowedSessionsById[allowedSession.sessionId]).toEqual(expect.objectContaining({
      sessionId: allowedSession.sessionId,
      user: allowedSession.user,
    }))

    await authenticatedUser.logout()

    expect(allowedSessionsById[allowedSession.sessionId]).toBeUndefined()
  })

  it('should delete all other allowed Sessions on logoutAllOtherDevices', async () => {
    await authenticatedUser.logoutAllOtherDevices()

    expect(allowedSessionsById[allowedSession.sessionId]).toEqual(expect.objectContaining({
      sessionId: allowedSession.sessionId,
      user: allowedSession.user,
    }))

    for (const allowedSessionOtherDatabase of allowedOtherSessionsInDatabase) {
      expect(allowedSessionsById[allowedSessionOtherDatabase.sessionId]).toBeUndefined()
    }
  })
})
