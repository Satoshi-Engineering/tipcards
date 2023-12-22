import axios, { AxiosResponse } from 'axios'

import { type Set } from '@shared/data/api/Set'
import hashSha256 from '@backend/services/hashSha256'

import LNURLAuth from './lightning/LNURLAuth'

export default class FrontendSimulator {
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

  async login() {
    const authWallet = new LNURLAuth()
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
    const response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/create`)
    this.authServiceLoginHash = response.data.data.hash
    return response
  }

  async authStatus() {
    const response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/status/${this.authServiceLoginHash}`)

    this.accessToken = response.data.data.accessToken
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async authRefresh() {
    const response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/refresh`, this.getRefreshHeader())
    this.accessToken = response.data.data.accessToken
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async logout() {
    return await axios.post(`${process.env.TEST_API_ORIGIN}/api/auth/logout`, {}, this.getRefreshHeader())
  }

  async logoutAllOtherDevices() {
    const response = await axios.post(`${process.env.TEST_API_ORIGIN}/api/auth/logoutAllOtherDevices`, {}, this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async getProfile() {
    const response = await axios.get(`${process.env.TEST_API_ORIGIN}/api/auth/profile`, this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async setProfile(accountName: string, displayName: string, email: string) {
    const response = await axios.post(`${process.env.TEST_API_ORIGIN}/api/auth/profile`, {
      accountName,
      displayName,
      email,
    },this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
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

  setRefreshTokenFromResponse(response: AxiosResponse) {
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

    this.refreshToken = match.groups['refreshToken']
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
}
