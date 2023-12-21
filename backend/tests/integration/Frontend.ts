import axios, { AxiosResponse } from 'axios'
import hashSha256 from '@backend/services/hashSha256'

export default class Frontend {
  authServiceLoginHash = ''
  accessToken = ''
  refreshToken = ''

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

  getRefreshTokenFromResponse(response: AxiosResponse) {
    const cookies = response.headers['set-cookie']

    if (cookies === undefined) {
      throw new Error('no cookies set')
    }

    const match = cookies[0].match(/(^| )refresh_token=(?<refreshToken>[^;]+)/)
    if (match == null) {
      throw new Error('refresh_token in cookies not found or cookie not in cookies[0]')
    }
    if (match.groups == null) {
      throw new Error('refresh_token not found in cookie')
    }

    return match.groups['refreshToken']
  }

  async authCreate() {
    const response = await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/create`)
    this.authServiceLoginHash = response.data.data.hash
    return response
  }

  async authStatus() {
    const response = await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/status/${this.authServiceLoginHash}`)

    this.accessToken = response.data.data.accessToken
    this.refreshToken = this.getRefreshTokenFromResponse(response)
    return response
  }

  async authRefresh() {
    let cookies = ''
    if (this.refreshToken) cookies += `refresh_token=${this.refreshToken}`

    const response = await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/refresh`, {
      headers: {
        'Cookie': cookies,
      },
    })

    this.accessToken = response.data.data.accessToken
    return response
  }

  async getProfile() {
    let cookies = ''
    if (this.refreshToken) cookies += `refresh_token=${this.refreshToken}`

    return await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/profile`, {
        headers: {
          'Cookie': cookies,
        },
      })
  }

  async setProfile(accountName: string, displayName: string, email: string) {
    let cookies = ''
    if (this.refreshToken) cookies += `refresh_token=${this.refreshToken}`

    return await axios.post(`${process.env.JWT_AUTH_ORIGIN}/api/auth/profile`, {
      accountName,
      displayName,
      email,
    },{
      headers: {
        'Cookie': cookies,
      },
    })
  }

  async logout() {
    let cookies = ''
    if (this.refreshToken) cookies += `refresh_token=${this.refreshToken}`

    return await axios.post(`${process.env.JWT_AUTH_ORIGIN}/api/auth/logout`, {}, {
      headers: {
        'Cookie': cookies,
      },
    })
  }

  async logoutAllOtherDevices() {
    let cookies = ''
    if (this.refreshToken) cookies += `refresh_token=${this.refreshToken}`

    return await axios.post(`${process.env.JWT_AUTH_ORIGIN}/api/auth/logoutAllOtherDevices`, {}, {
      headers: {
        'Cookie': cookies,
      },
    })
  }
}
