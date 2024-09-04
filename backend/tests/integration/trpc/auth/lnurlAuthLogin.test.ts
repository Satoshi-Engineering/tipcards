import '@backend/initEnv.js' // Info: .env needs to read before imports

import '../../../lib/mocks/lnurl.js'
import '../../../lib/mocks/socketIo.js'
import '../../../lib/mocks/http.js'

import { describe, it, expect, beforeAll, vi } from 'vitest'
import http from 'http'

import { createCallerFactory } from '@backend/trpc/trpc.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

import '../../lib/initAxios.js'
import { lnurlAuthRouter } from '@backend/trpc/router/auth/lnurlAuth.js'
import Auth from '@backend/domain/auth/Auth.js'
import SocketIoServer from '@backend/services/SocketIoServer.js'
import LnurlServer from '@backend/services/LnurlServer.js'
import LnurlAuthLogin from '@backend/domain/auth/LnurlAuthLogin.js'

const createCaller = createCallerFactory(lnurlAuthRouter)

beforeAll(async () => {
  const server = new http.Server()
  LnurlServer.init()
  SocketIoServer.init(server)
  await Auth.init()
})

describe('TRpc Router Auth LnurlAuthLogin', () => {
  const caller = createCaller({
    host: new URL(TIPCARDS_API_ORIGIN).host,
    jwt: null,
    accessToken: null,
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
