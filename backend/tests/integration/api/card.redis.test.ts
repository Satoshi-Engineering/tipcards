import axios, { AxiosError } from 'axios'
import '../initEnv'

describe('card', () => {
  it('should return 404 if the card (IN REDIS) doesn\' exist', async () => {
    let caughtError: AxiosError
    try {
      await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/aHashThatDoesntExist`)
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })
})
