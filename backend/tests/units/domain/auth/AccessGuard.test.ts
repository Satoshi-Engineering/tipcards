import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { Request } from 'express'
import { TRPCError } from '@trpc/server'
import { randomUUID } from 'crypto'

import '../../mocks/process.env.js'
import '../../mocks/drizzle.js'
import '../../mocks/database/client.js'
import {
  addData,
} from '../../mocks/database/database.js'
import JwtValidator from '@shared/modules/Jwt/JwtValidator.js'

import AccessGuard from '@backend/domain/auth/AccessGuard.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import {
  createUser,
} from '../../../drizzleData.js'

let accessGuard: AccessGuard
const mockHost = 'domain.com'
const mockUserId = 'mockUserId'
const mockUser = createUser(mockUserId)
const mockAccessToken = 'mockAccessToken'
const mockAccessTokenPayload = {
  userId: mockUserId,
  permissions: [],
  nonce: randomUUID(),
}
const mockRequest = {
  get: vi.fn(),
  headers: {
    authorization: undefined,
  },
} as unknown as Request
const mockJwtValidator = {
  createJwt: vi.fn(),
  validate: vi.fn(),
} as unknown as JwtValidator

beforeAll(() => {
  addData({
    users: [mockUser],
  })
})

beforeEach(() => {
  mockRequest.headers.authorization = undefined
  accessGuard = new AccessGuard({
    request: mockRequest,
    jwtValidator: mockJwtValidator,
  })
})

describe('AccessGuard', () => {
  it('should fail due missing host', async () => {
    await expect(accessGuard.authenticateUserViaAccessToken())
      .rejects.toThrowError(new TRPCError({ code: 'INTERNAL_SERVER_ERROR' }))
  })

  it('should fail due missing authorization header', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    await expect(accessGuard.authenticateUserViaAccessToken())
      .rejects.toThrowError(new TRPCError({ code: 'UNAUTHORIZED' }))
  })

  it('should fail due jwt is garbage', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    vi.spyOn(mockJwtValidator, 'validate').mockRejectedValueOnce(new Error())
    mockRequest.headers.authorization = 'accesstoken garbage'
    await expect(accessGuard.authenticateUserViaAccessToken())
      .rejects.toThrow(new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid authorization token.' }))
  })

  it('should fail due access token payload is not in the correct format', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    vi.spyOn(mockJwtValidator, 'validate').mockResolvedValueOnce({})
    mockRequest.headers.authorization = mockAccessToken
    await expect(accessGuard.authenticateUserViaAccessToken())
      .rejects.toThrow(new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'JWT payload parsing failed.' }))
  })

  it('should fail due missing permission', async () => {
    const permission = 'support'
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    vi.spyOn(mockJwtValidator, 'validate').mockResolvedValueOnce(mockAccessTokenPayload)
    mockRequest.headers.authorization = mockAccessToken
    await expect(accessGuard.authenticateUserViaAccessToken({
      requiredPermissions: [permission],
    }))
      .rejects.toThrow(new TRPCError({ code: 'FORBIDDEN', message: `Missing permissions: ${permission}` }))
  })

  it('should succeed permission check', async () => {
    const permission = 'support'
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    vi.spyOn(mockJwtValidator, 'validate').mockResolvedValueOnce({
      ...mockAccessTokenPayload,
      permissions: [permission],
    })
    mockRequest.headers.authorization = mockAccessToken
    await expect(accessGuard.authenticateUserViaAccessToken({
      requiredPermissions: [permission],
    }))
  })

  it('should fail due missing user in database', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    mockRequest.headers.authorization = mockAccessToken
    vi.spyOn(mockJwtValidator, 'validate').mockResolvedValueOnce({
      ...mockAccessTokenPayload,
      userId: 'unknownUserId',
    })
    await expect(accessGuard.authenticateUserViaAccessToken())
      .rejects.toThrow(new ErrorWithCode('User not found.', ErrorCode.UnknownDatabaseError))
  })

  it('should validate user via access token in header', async () => {
    vi.spyOn(mockRequest, 'get').mockReturnValueOnce(mockHost)
    mockRequest.headers.authorization = mockAccessToken
    vi.spyOn(mockJwtValidator, 'validate').mockResolvedValueOnce(mockAccessTokenPayload)
    const authenticatedUser = await accessGuard.authenticateUserViaAccessToken()
    expect(authenticatedUser.id).toEqual(mockAccessTokenPayload.userId)
  })
})
