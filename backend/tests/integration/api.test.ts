import axios from 'axios'
import 'dotenv/config'

describe('dummy api', () => {
  it('returns success state', async () => {
    const { data } = await axios.get(`${process.env.TEST_API_ORIGIN}/api/dummy`)
    expect(data.status).toBe('success')
  })
})
