import '../../mocks/process.env.js'
import '../../mocks/lnurl.js'
import type { LnurlServerMock } from '../../mocks/lnurl.js'
import '../../mocks/http.js'

import { Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { describe, it, expect, vi } from 'vitest'

import { LnurlAuthLoginStatusEnum } from '@shared/auth/data/trpc/LnurlAuthLoginStatusEnum.js'

import { createCallerFactory } from '@auth/trpc/trpc.js'
import { lnurlAuthRouter } from '@auth/trpc/router/lnurlAuth.js'
import Auth from '@auth/domain/Auth.js'
import LnurlServer from '@auth/services/LnurlServer.js'
import LnurlAuthLogin from '@auth/domain/LnurlAuthLogin.js'
import RefreshGuard from '@auth/domain/RefreshGuard.js'
import type { LoginEvent } from '@auth/types/LoginEvent.js'

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
  const auth = Auth.instance
  const jwtIssuer = auth.jwtIssuer

  const lnurlAuthId = 'c506222e47d39be202d6ecc5e74139e2a68fab7bf5b46401c03d4d3395a4876d'
  const lnurlAuthEncoded = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e3843n2vpkxgeryef5xajrxwtzv5erqvnyxejkxce4v5mngvfn89jnycfk8pnxzc3hvfnr2c35xc6rqvtrxqekgdryxvenjdtpxsurwdnyxkdxxr'
  const lnurlAuthSecret = randomUUID()
  const lnurlAuthHash = LnurlAuthLogin.createHashFromSecret(lnurlAuthSecret)
  vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValue({
    url: 'mockUrl',
    encoded: lnurlAuthEncoded,
    secret: lnurlAuthSecret,
  })

  const sendLoginEvent = (event: LoginEvent) => {
    const lnurlServerMock = LnurlServer.getServer() as LnurlServerMock
    return lnurlServerMock.sendLoginEvent(event)
  }

  const caller = createCaller({
    auth,
    refreshGuard: new RefreshGuard(mockRequest, mockResponse, jwtIssuer, mockAccessTokenAudience),
  })

  it('should return an encoded lnurlauth with hashed secret', async () => {
    const lnurlAuthLogin = await caller.create()

    expect(lnurlAuthLogin).toEqual({
      id: lnurlAuthId,
      lnurlAuth: lnurlAuthEncoded,
      hash: lnurlAuthHash,
      status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
    })
  })

  it ('should send logged in event', async () => {
    const loginGenerator = await caller.login({ lastEventId: lnurlAuthId })
    setTimeout(() => {
      sendLoginEvent({
        key: randomUUID(),
        hash: lnurlAuthHash,
      })
    }, 10)

    const data = await loginGenerator[Symbol.asyncIterator]().next()
    expect(data.value).toEqual(expect.arrayContaining([
      lnurlAuthId,
      expect.objectContaining({
        id: lnurlAuthId,
        status: LnurlAuthLoginStatusEnum.enum.loggedIn,
      }),
    ]))
  })

  it('should send multiple different lnurls', async () => {
    const id1 = '18c5b44fa8f62a51d011c1be4f3487f81a15fbb4434012c4de72d2b3e696c392'
    const encoded1 = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e385cnsce4vg6rgenp8pnrvvnpx5ckgvp3x93nzcn9x3nrxdpcxanrsvtpxy6kvcnzxs6rxdpsxyexxdryv5mnyepjvgek2d3exe3nxwfj24nmkf'
    const secret1 = randomUUID()
    vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: encoded1,
      secret: secret1,
    })
    const data1 = await caller.create()

    const id2 = 'de57e3961507733f96b0fd579b3668e268d5c38da7238516687f7f596956e6f3'
    const encoded2 = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83'
    const secret2 = randomUUID()
    vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded: encoded2,
      secret: secret2,
    })
    const data2 = await caller.create()

    expect(data1).toEqual({
      id: id1,
      lnurlAuth: encoded1,
      hash: LnurlAuthLogin.createHashFromSecret(secret1),
      status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
    })
    expect(data2).toEqual({
      id: id2,
      lnurlAuth: encoded2,
      hash: LnurlAuthLogin.createHashFromSecret(secret2),
      status: LnurlAuthLoginStatusEnum.enum.lnurlCreated,
    })
  })

  it('should resume a subscription if a event id is sent', async () => {
    const encoded1 = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e385cnsce4vg6rgenp8pnrvvnpx5ckgvp3x93nzcn9x3nrxdpcxanrsvtpxy6kvcnzxs6rxdpsxyexxdryv5mnyepjvgek2d3exe3nxwfj24nmkf'
    const secret1 = randomUUID()
    const { id: id1 } = await createLnurlAuth(encoded1, secret1)

    const encoded2 = 'lnurl1dp68gup69uhkcmmrv9kxsmmnwsargvpsxyhkcmn4wfkr7arpvu7kcmm8d9hzv6e384jx2dfhv5enjd33x5crwdenxdnrjdnzxpnxgdfh893rxd3k8pjnyd3cvs6kxvecv3snwv3n8q6nzd3k8qmkvdmxx5unvwf4xejnve3np7qj83'
    const secret2 = randomUUID()
    const { id: id2 } = await createLnurlAuth(encoded2, secret2)

    const loginGenerator1 = await caller.login({ lastEventId: id1 })
    setTimeout(() => {
      sendLoginEvent({
        key: id1,
        hash: LnurlAuthLogin.createHashFromSecret(secret1),
      })
    }, 10)
    const data1 = await loginGenerator1[Symbol.asyncIterator]().next()

    const loginGenerator2 = await caller.login({ lastEventId: id1 })
    setTimeout(() => {
      sendLoginEvent({
        key: id2,
        hash: LnurlAuthLogin.createHashFromSecret(secret2),
      })
    }, 10)
    const data2 = await loginGenerator2[Symbol.asyncIterator]().next()

    expect(data1.value).toEqual(expect.arrayContaining([
      id1,
      expect.objectContaining({
        id: id1,
        status: LnurlAuthLoginStatusEnum.enum.loggedIn,
      }),
    ]))
    expect(data2.value).toEqual(expect.arrayContaining([
      id1,
      expect.objectContaining({
        id: id1,
        status: LnurlAuthLoginStatusEnum.enum.loggedIn,
      }),
    ]))
  })

  const createLnurlAuth = async (encoded: string, secret: string) => {
    vi.spyOn(LnurlServer.getServer(), 'generateNewUrl').mockResolvedValue({
      url: 'mockUrl',
      encoded,
      secret,
    })
    return await caller.create()
  }
})
