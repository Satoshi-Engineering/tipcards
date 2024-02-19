import axios from 'axios'

import '@backend/initEnv' // Info: .env needs to read before imports

describe('dummy api', () => {
  it('returns success state', async () => {
    const { data } = await axios.get(`${process.env.TEST_API_ORIGIN}/api/dummy`)
    expect(data.status).toBe('success')
  })
})
