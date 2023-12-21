import axios, { AxiosError, AxiosResponse } from 'axios'
import hashSha256 from '@backend/services/hashSha256'

export default class Frontend {
  async createCardViaAPI(cardHash: string, amount: number, text = '', note = '') {
    return await axios.post(`${process.env.TEST_API_ORIGIN}/api/invoice/create/${cardHash}`, {
      amount,
      text,
      note,
    })
  }

  async loadCard(cardHash: string) {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/card/${cardHash}?origin=cards`)
  }
  async loadLnurlForCardHash(cardHash: string) {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/lnurl/${cardHash}`)
  }

  getCardHashBySetIdAndCardIndex(setId: string, cardIndex: number) {
    return hashSha256(`${setId}/${cardIndex}`)
  }

  async loadSets() {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/`)
  }

  async loadSet(setId: string) {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/${setId}`)
  }

  async createSetFundingInvoice(setId: string, amountPerCard: number, cardIndices: number[], text = '', note = '') {
    return await axios.post(`${process.env.TEST_API_ORIGIN}/api/set/invoice/${setId}`, {
      amountPerCard,
      cardIndices,
      text,
      note,
    })
  }

  async deleteSetFundingInvoice(setId: string) {
    return await axios.delete(`${process.env.TEST_API_ORIGIN}/api/set/invoice/${setId}`)
  }

  async authStatus(hash: string) {
    return await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/status/${hash}`)
  }

  async authRefresh(cookie: string) {
    return await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/refresh`, {
      headers:{
        Cookie: cookie
      },
    })
  }

  async authCreate() {
    return await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/create`)
  }
}
