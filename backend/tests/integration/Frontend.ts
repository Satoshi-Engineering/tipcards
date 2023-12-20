import axios, { AxiosError, AxiosResponse } from 'axios'

export default class Frontend {
  async createCardViaAPI(cardHash: string, amount: number, text = '', note = '') {
    return await axios.post(`${process.env.TEST_API_ORIGIN}/api/invoice/create/${cardHash}`, {
      amount,
      text,
      note,
    })
  }

  async loadSets() {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/`)
  }

  async loadSet(setId: string) {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/${setId}`)
  }

  async authRefresh() {
    let caughtError: AxiosError | null = null

    try {
      const response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/refresh`)
      return response.data
    } catch (error) {
      caughtError = error as AxiosError
      if (caughtError?.response?.status !== 401) {
        throw error
      }

      return null
    }
  }

  async authCreate() {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/create`)
  }
}
