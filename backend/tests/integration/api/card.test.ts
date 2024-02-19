import axios, { AxiosError } from 'axios'

import '@backend/initEnv' // Info: .env needs to read before imports

import { API_ORIGIN } from '../lib/constants'

describe('card', () => {
  it('should return 404 if the card doesn\' exist', async () => {
    let caughtError: AxiosError
    try {
      await axios.get(`${API_ORIGIN}/api/card/aHashThatDoesntExist`)
      expect(false).toBe(true)
      return
    } catch (error) {
      caughtError = error as AxiosError
    }
    expect(axios.isAxiosError(caughtError)).toBe(true)
    expect(caughtError?.response?.status).toBe(404)
  })
})
