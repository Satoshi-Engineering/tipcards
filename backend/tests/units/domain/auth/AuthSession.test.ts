import { describe, vi, it, expect, beforeEach } from 'vitest'

import '../../mocks/process.env.js'

import AuthSession from '@backend/domain/auth/AuthSession.js'
import { Request, Response } from 'express'

describe('AuthSession', () => {
  let authSession: AuthSession

  const mockRequest = {
    cookie: vi.fn(),
  } as unknown as Request
  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response

  beforeEach(() => {
    authSession = new AuthSession(mockRequest, mockResponse)
  })

  it('set refresh token as cookie in http response', () => {
    const refreshToken = 'mockRefreshToken'
    authSession.setRefreshTokenCookie('mockRefreshToken')

    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'refresh_token',
      refreshToken,
      {
        expires: expect.any(Date),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      },
    )
  })

  it('clear refresh token cookie on logout', async () => {
    authSession.logout()

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
