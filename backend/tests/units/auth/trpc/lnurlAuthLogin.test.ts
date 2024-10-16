import '@backend/initEnv.js' // Info: .env needs to read before imports

import '../../../lib/mocks/lnurl.js'
import '../../../lib/mocks/socketIo.js'
import '../../../lib/mocks/http.js'

import { describe, it, expect, vi } from 'vitest'
import http from 'http'
import { Request, Response } from 'express'

import '../../../integration/lib/initAxios.js'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { lnurlAuthRouter } from '@auth/trpc/router/lnurlAuth.js'
import SocketIoServer from '@auth/services/SocketIoServer.js'
import Auth from '@auth/domain/Auth.js'
import LnurlServer from '@auth/services/LnurlServer.js'
import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'

const createCaller = createCallerFactory(lnurlAuthRouter)

describe('TRpc Router Auth LnurlAuthLogin', async () => {
  const mockAccessTokenAudience = 'mockAccessTokenIssuer'
  const mockRequest = {
    cookie: vi.fn(),
  } as unknown as Request
  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  } as unknown as Response

  const server = new http.Server()
  LnurlServer.init()
  SocketIoServer.init(server)
  await Auth.init(mockAccessTokenAudience)
  const auth = Auth.getAuth()
  const jwtIssuer = auth.getJwtIssuer()

  const caller = createCaller({
    auth,
    refreshGuard: new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience),
  })

  it('should return an encoded lnurlauth with hashed auth secret', async () => {
    const lnurlAuth = 'mockLnurlAuth'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: lnurlAuth,
      secret: secret,
    })

    const lnurlAuthLogin = await caller.create()

    expect(lnurlAuthLogin.lnurlAuth).toBe(lnurlAuth)
    expect(lnurlAuthLogin.hash).toBe(hash)
  })
})
