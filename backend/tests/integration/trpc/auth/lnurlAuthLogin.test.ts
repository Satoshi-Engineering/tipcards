import '@backend/initEnv.js' // Info: .env needs to read before imports

import '../../../lib/mocks/lnurl.js'
import '../../../lib/mocks/socketIo.js'
import '../../../lib/mocks/http.js'

import { describe, it, expect, vi } from 'vitest'
import http from 'http'
import { Response } from 'express'

import { createCallerFactory } from '@backend/domain/auth/trpc/trpc.js'

import '../../lib/initAxios.js'
import { lnurlAuthRouter } from '@backend/domain/auth/trpc/router/lnurlAuth.js'
import SocketIoServer from '@backend/domain/auth/services/SocketIoServer.js'
import Auth from '@backend/domain/auth/Auth.js'
import LnurlServer from '@backend/domain/auth/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/domain/auth/LnurlAuthLogin.js'
import AuthSession from '@backend/domain/auth/AuthSession.js'

const createCaller = createCallerFactory(lnurlAuthRouter)

describe('TRpc Router Auth LnurlAuthLogin', () => {
  const mockResponse = {
    cookie: vi.fn(),
  } as unknown as Response

  const server = new http.Server()
  LnurlServer.init()
  SocketIoServer.init(server)
  Auth.init()

  const caller = createCaller({
    auth: Auth.getAuth(),
    session: new AuthSession(mockResponse),
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
