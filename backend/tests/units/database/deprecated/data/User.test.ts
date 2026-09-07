import { describe, it, expect } from 'vitest'

import { User } from '@backend/database/deprecated/data/User.js'

const user = {
  id: 'user-id',
  lnurlAuthKey: 'auth-key',
  created: 1700000000,
}

describe('deprecated User schema', () => {
  it('fills profile fields when a stored user has no profile', () => {
    expect(User.parse(user).profile).toEqual({
      accountName: '',
      displayName: '',
      email: '',
    })
  })

  it('preserves stored profile fields and fills missing fields', () => {
    expect(User.parse({ ...user, profile: { accountName: 'Alice' } }).profile).toEqual({
      accountName: 'Alice',
      displayName: '',
      email: '',
    })
  })

  it('rejects invalid stored profile fields instead of replacing them with defaults', () => {
    expect(User.safeParse({ ...user, profile: { accountName: 42 } }).success).toBe(false)
    expect(User.safeParse({ ...user, profile: null }).success).toBe(false)
  })
})
