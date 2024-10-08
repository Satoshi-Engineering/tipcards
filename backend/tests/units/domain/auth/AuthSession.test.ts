import { describe, it, expect, beforeEach } from 'vitest'

import '../../mocks/process.env.js'

import AuthSession from '@backend/domain/auth/AuthSession.js'
import { Request, Response } from 'express'

describe('AuthSession', () => {
  let authSession: AuthSession

  const mockRequest = {
  } as unknown as Request
  const mockResponse = {
  } as unknown as Response

  beforeEach(() => {
    authSession = new AuthSession(mockRequest, mockResponse)
  })

  it.skip('example skipped test - WIP', () => {
    expect(authSession).toBeInstanceOf(AuthSession)
  })
})
