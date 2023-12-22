import axios, { AxiosResponse } from 'axios'
import hashSha256 from '@backend/services/hashSha256'
import LocalWallet from './lightning/LocalWallet'
import { type Set } from '@shared/data/api/Set'

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

  getRefreshHeader() {
    if (this.refreshToken === '') return {}

    return {
      headers: {
        'Cookie': `refresh_token=${this.refreshToken}`,
      },
    }
  }

  getAccessHeader() {
    if (this.accessToken === '') return {}

    return {
      headers: {
        'Authorization': this.accessToken,
      },
    }
  }

  async authAndLogin() {
    const authWallet = new LocalWallet()

    const response: AxiosResponse = await this.authCreate()
    await authWallet.loginWithLNURLAuth(response.data.data.encoded)
    await this.authStatus()
  }

  clearLoginAndAuth() {
    this.authServiceLoginHash = ''
    this.accessToken = ''
    this.refreshToken = ''
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
    const response = await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/refresh`, this.getRefreshHeader())
    this.accessToken = response.data.data.accessToken
    return response
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
    return await axios.post(`${process.env.JWT_AUTH_ORIGIN}/api/auth/logoutAllOtherDevices`, {}, this.getRefreshHeader())
  }

  async getProfile() {
    return await axios.get(`${process.env.JWT_AUTH_ORIGIN}/api/auth/profile`, this.getRefreshHeader())
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

  async loadSets() {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/`, this.getAccessHeader())
  }

  async loadSet(setId: string) {
    return await axios.get(`${process.env.TEST_API_ORIGIN}/api/set/${setId}`, this.getAccessHeader())
  }

  async saveSet(set: Set) {
    return await axios.post(`${process.env.TEST_API_ORIGIN}/api/set/${set.id}`, set, this.getAccessHeader())
  }
}
