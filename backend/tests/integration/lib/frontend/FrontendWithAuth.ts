import axios, { AxiosResponse } from 'axios'

import { Set } from '@shared/data/api/Set.js'

import Frontend from './Frontend.js'
import { API_ORIGIN } from '../constants.js'

export default class FrontendWithAuth extends Frontend {
  authServiceLoginHash = ''
  accessToken = ''
  refreshToken = ''

  clearLoginAndAuth() {
    this.authServiceLoginHash = ''
    this.accessToken = ''
    this.refreshToken = ''
  }

  async authCreate() {
    const response = await axios.get(`${API_ORIGIN}/api/auth/create`)
    this.authServiceLoginHash = response.data.data.hash
    return response
  }

  async authStatus() {
    const response = await axios.get(`${API_ORIGIN}/api/auth/status/${this.authServiceLoginHash}`)

    this.accessToken = response.data.data.accessToken
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async authRefresh() {
    const response = await axios.get(`${API_ORIGIN}/api/auth/refresh`, this.getRefreshHeader())
    this.accessToken = response.data.data.accessToken
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async logout() {
    return await axios.post(`${API_ORIGIN}/api/auth/logout`, {}, this.getRefreshHeader())
  }

  async logoutAllOtherDevices() {
    const response = await axios.post(`${API_ORIGIN}/api/auth/logoutAllOtherDevices`, {}, this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async getProfile() {
    const response = await axios.get(`${API_ORIGIN}/api/auth/profile`, this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async setProfile(accountName: string, displayName: string, email: string) {
    const response = await axios.post(`${API_ORIGIN}/api/auth/profile`, {
      accountName,
      displayName,
      email,
    },this.getRefreshHeader())
    this.setRefreshTokenFromResponse(response)
    return response
  }

  async loadSets() {
    return await axios.get(`${API_ORIGIN}/api/set/`, this.getAccessHeader())
  }

  async loadSet(setId: string) {
    return await axios.get(`${API_ORIGIN}/api/set/${setId}`, this.getAccessHeader())
  }

  async saveSet(set: Set) {
    return await axios.post(`${API_ORIGIN}/api/set/${set.id}`, set, this.getAccessHeader())
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
    if (this.refreshToken === '') { return {} }

    return {
      headers: {
        'Cookie': `refresh_token=${this.refreshToken}`,
      },
    }
  }

  getAccessHeader() {
    if (this.accessToken === '') { return {} }

    return {
      headers: {
        'Authorization': this.accessToken,
      },
    }
  }
}
