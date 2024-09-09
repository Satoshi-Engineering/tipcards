import { describe, it, expect } from 'vitest'
import axios from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import '../../lib/initAxios.js'
import { API_ORIGIN } from '../../lib/constants.js'

describe('auth', () => {
  it('should return public key from jwt', async () => {
    const response = await axios.get(`${API_ORIGIN}/auth/api/publicKey`)
    expect(response.data.status).toBe('success')
    expect(response.data.data).toContain('-----BEGIN PUBLIC KEY-----')
    expect(response.data.data).toContain('-----END PUBLIC KEY-----')
  })
})
