import { describe, vi, it, expect, beforeEach } from 'vitest'

import '../../mocks/process.env.js'

import LoginInformer from '@auth/domain/LoginInformer.js'

describe('LoginInformer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should resolve login', async () => {
    const loginInformer = new LoginInformer()
    setTimeout(() => {
      loginInformer.emitLoginSuccessful('hash1')
    }, 30)

    const waitForLoginSpy = vi.fn((hash: string) => loginInformer.waitForLogin(hash))
    await waitForLoginSpy('hash1')

    expect(waitForLoginSpy).toHaveResolved()
  })

  it('should not resolve multiple times', async () => {
    const loginInformer = new LoginInformer()
    setTimeout(() => {
      loginInformer.emitLoginSuccessful('hash1')
      loginInformer.emitLoginSuccessful('hash1')
    }, 30)

    const waitForLoginSpy = vi.fn((hash: string) => loginInformer.waitForLogin(hash))
    await waitForLoginSpy('hash1')

    expect(waitForLoginSpy).toHaveResolvedTimes(1)
  })

  it('should reject login', async () => {
    const loginInformer = new LoginInformer()
    setTimeout(() => {
      loginInformer.emitLoginFailed('hash1')
    }, 30)

    expect(loginInformer.waitForLogin('hash1')).rejects.toThrow()
  })
})
