import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import '../../mocks/http.js'

import { Request, Response } from 'express'
import { describe, it, expect, vi } from 'vitest'

import { LnurlAuthLoginStatusEnum } from '@shared/auth/data/trpc/LnurlAuthLoginDto.js'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { lnurlAuthRouter } from '@auth/trpc/router/lnurlAuth.js'
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

  await Auth.init(mockAccessTokenAudience)
  const auth = Auth.getAuth()
  const jwtIssuer = auth.getJwtIssuer()

  const caller = createCaller({
    auth,
    refreshGuard: new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience),
  })

  it('should return an encoded lnurlauth with hashed auth secret', async () => {
    const lnurlAuth = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e3843n2vpkxgeryef5xajrxwtzv5erqvnyxejkxce4v5mngvfn89jnycfk8pnxzc3hvfnr2c35xc6rqvtrxqekgdryxvenjdtpxsurwdnyxkdxxr'
    const secret = 'mockSecret'
    const hash = LnurlAuthLogin.createHashFromSecret(secret)
    vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValueOnce({
      url: 'mockUrl',
      encoded: lnurlAuth,
      secret: secret,
    })

    const lnurlAuthLogin = await caller.create()

    expect(lnurlAuthLogin).toEqual({
      lnurlAuth,
      hash,
      status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
    })
  })

  // todo : create tests for login procedure
})
