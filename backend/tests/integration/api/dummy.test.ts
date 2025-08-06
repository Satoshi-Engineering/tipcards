import { describe, it, expect } from 'vitest'
import axios from 'axios'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { API_ORIGIN } from '../lib/constants.js'
import '../lib/initAxios.js'

describe('dummy api', () => {
  it('returns success state', async () => {
    // eslint-disable-next-line no-console
    console.info(`Testing dummy API endpoint: ${API_ORIGIN}/api/dummy`)
    const response = await axios.get(`${API_ORIGIN}/api/dummy`)
    // eslint-disable-next-line no-console
    console.info('Response from dummy API:', response)
    // eslint-disable-next-line no-console
    console.info('Response from dummy API:', response.data)
    expect(response.data.status).toBe('success')
  })
})
