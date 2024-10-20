import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import { addData, allowedRefreshTokensByHash } from '../../mocks/database/database.js'

import RefreshGuard from '@auth/domain/RefreshGuard.js'

import { createUser, createProfileForUser, createAllowedRefreshTokens } from '../../../drizzleData.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'
import JwtIssuer from '@shared/modules/Jwt/JwtIssuer.js'

import { JWT_AUTH_ISSUER } from '@backend/constants.js'

const REFRESH_TOKEN_EXPIRATION_TIME = '28 days'
const ACCESS_TOKEN_EXPIRATION_TIME = '5 min'

const mockNonce = randomUUID()
const mockAccessTokenAudience = 'mockAccessTokenAudience'
const mockwalletLinkingKey = 'mockwalletLinkingKey'
const mockUserId = 'mockUserId'
const mockUser = createUser(mockUserId)
mockUser.lnurlAuthKey = mockwalletLinkingKey
const mockProfile = createProfileForUser(mockUser)
const mockAllowedRefreshTokens = createAllowedRefreshTokens(mockUser)
const mockAllowedOtherRefreshTokens = createAllowedRefreshTokens(mockUser)
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

// Authenticate User via Refresh Token
const setValidRefreshToken = () => {
  vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
  mockRequest.headers.cookie = mockRefreshTokenCookie

  const mockRefreshTokenPayload = {
    id: mockUserId,
    lnurlAuthKey: 'mockLnurlAuthKey',
    permissions: [],
    nonce: mockNonce,
  }
  vi.spyOn(mockJwtIssuer, 'validate').mockResolvedValueOnce(mockRefreshTokenPayload)
}

const authUserViaRefreshToken = async () => {
  setValidRefreshToken()
  await refreshGuard.authenticateUserViaRefreshToken()
}

beforeAll(() => {
  addData({
    users: [mockUser],
    profiles: [mockProfile],
  })
})

describe('RefreshGuard', () => {
  beforeEach(() => {
    refreshGuard = new RefreshGuard(mockRequest, mockResponse, mockJwtIssuer, mockAccessTokenAudience)
    Object.keys(allowedRefreshTokensByHash).forEach(key => {
      delete allowedRefreshTokensByHash[key]
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
        id: mockUserId,
        lnurlAuthKey: mockwalletLinkingKey,
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

  it('should fail refresh token validation due missing entry in database', async () => {
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

  it('should validate refresh json web token from cookie', async () => {
    setValidRefreshToken()

    await refreshGuard.authenticateUserViaRefreshToken()
    expect(mockJwtIssuer.validate).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it('should fail refresh token cycling due missing user', async () => {
    await expect(async () => {
      await refreshGuard.cycleRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotLoaded))
  })

  it('should cycle refresh token', async () => {
    await authUserViaRefreshToken()

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

  it('should fail authorization token creation due missing user', async () => {
    await expect(async () => {
      await refreshGuard.createAccessTokenForUser()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotLoaded))
  })

  it('should create an new authorization token for the user', async () => {
    await authUserViaRefreshToken()

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
        nonce: expect.any(String),
      }),
    )
  })

  it('should fail to logoutAllOtherDevices due missing user', async () => {
    await expect(async () => {
      await refreshGuard.logoutAllOtherDevices()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotLoaded))
  })

  it('should logoutAllOtherDevices', async () => {
    await authUserViaRefreshToken()
    await refreshGuard.logoutAllOtherDevices()
    expect(allowedRefreshTokensByHash).toEqual(expect.objectContaining({
      [mockAllowedRefreshTokens.hash]: mockAllowedRefreshTokens,
    }))
  })
})
