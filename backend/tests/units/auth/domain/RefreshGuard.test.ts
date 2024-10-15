import { describe, vi, it, expect, beforeAll, beforeEach } from 'vitest'
import { Request, Response } from 'express'

import '../../mocks/process.env.js'
import '../../mocks/jwt.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import { addData, allowedRefreshTokensByHash } from '../../mocks/database/database.js'

import { validateJwt, createRefreshToken, createAccessToken } from '@backend/services/jwt.js'
import RefreshGuard from '@backend/auth/domain/RefreshGuard.js'

import { createUser, createProfileForUser, createAllowedRefreshTokens } from '../../../drizzleData.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

const mockWalletPublicKey = 'mockWalletPublicKey'
const mockUserId = 'mockUserId'
const mockUser = createUser(mockUserId)
mockUser.lnurlAuthKey = mockWalletPublicKey
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

// Authenticate User via Refresh Token
const setValidRefreshToken = () => {
  vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
  mockRequest.headers.cookie = mockRefreshTokenCookie

  const mockRefreshTokenPayload = {
    id: mockUserId,
    lnurlAuthKey: 'mockLnurlAuthKey',
    permissions: [],
    nonce: 'mockNonce',
  }
  vi.mocked(validateJwt).mockResolvedValueOnce(mockRefreshTokenPayload)
}

const authUserViaRefreshToken = async () => {
  setValidRefreshToken()
  await refreshGuard.validateRefreshToken()
}

beforeAll(() => {
  addData({
    users: [mockUser],
    profiles: [mockProfile],
  })
})

describe('RefreshGuard', () => {
  beforeEach(() => {
    refreshGuard = new RefreshGuard(mockRequest, mockResponse)
    Object.keys(allowedRefreshTokensByHash).forEach(key => {
      delete allowedRefreshTokensByHash[key]
    })
    addData({
      allowedRefreshTokens: [mockAllowedRefreshTokens, mockAllowedOtherRefreshTokens],
    })
  })

  it('should create refresh token for login with walletPublicKey ', async () => {
    const mockNewRefreshToken = 'mockNewRefreshToken'
    vi.mocked(createRefreshToken).mockResolvedValueOnce(mockNewRefreshToken)

    await refreshGuard.loginWithWalletLinkingKey(mockWalletPublicKey)

    expect(createRefreshToken).toHaveBeenCalledOnce()
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
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthHostMissingInRequest))
  })

  it('should fail refresh token validation due json web token is missing in cookie', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)

    await expect(async () => {
      await refreshGuard.validateRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenMissing))
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
      nonce: 'mockNonce',
    }
    vi.mocked(validateJwt).mockResolvedValueOnce(mockRefreshTokenPayload)

    await expect(async () => {
      await refreshGuard.validateRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.RefreshTokenDenied))
    expect(validateJwt).toHaveBeenCalledWith(`${mockRefreshToken}${tokenGargabe}`, mockHost)
  })

  it('should validate refresh json web token from cookie', async () => {
    setValidRefreshToken()

    await refreshGuard.validateRefreshToken()
    expect(validateJwt).toHaveBeenCalledWith(mockRefreshToken, mockHost)
  })

  it('should fail refresh token cycling due missing user', async () => {
    await expect(async () => {
      await refreshGuard.cycleRefreshToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotLoaded))
  })

  it('should cycle refresh token', async () => {
    await authUserViaRefreshToken()

    const mockNewRefreshToken = 'mockNewRefreshToken'
    vi.mocked(createRefreshToken).mockResolvedValueOnce(mockNewRefreshToken)

    await refreshGuard.cycleRefreshToken()
    expect(createRefreshToken).toHaveBeenCalledTimes(2)
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
      await refreshGuard.createAccessToken()
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.AuthUserNotLoaded))
  })

  it('should create an new authorization token for the user', async () => {
    await authUserViaRefreshToken()

    const mockAuthorizationToken = 'mockAuthorizationToken'
    vi.mocked(createAccessToken).mockResolvedValueOnce(mockAuthorizationToken)

    const authorizationToken = await refreshGuard.createAccessToken()
    expect(authorizationToken).toBe(mockAuthorizationToken)
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
