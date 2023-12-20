import axios, { AxiosResponse } from 'axios'

import { type LNURLWithdrawRequest } from '@shared/data/LNURLWithdrawRequest'

import { getLnurlResponse } from '@backend/services/lnbitsHelpers'
import { decodeLnurl } from '@shared/modules/lnurlHelpers'

export default class LNBitsWallet {
  adminKey: string
  lnbitsOrigin: string

  constructor(lnbitsOrigin: string, adminKey: string) {
    this.adminKey = adminKey
    this.lnbitsOrigin = lnbitsOrigin
  }

  private getAuthHeader() {
    return {
      headers: {
        'X-Api-Key': this.adminKey,
      },
    }
  }

  public async getWalletDetails(): Promise<null | { id: string, name: string, balance: number }> {
    let response: AxiosResponse
    try {
      response = await axios.get(`${this.lnbitsOrigin}/api/v1/wallet`, this.getAuthHeader())
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }

  public async createInvoice(amount: number, memo = ''): Promise<null | { payment_hash: string, payment_request: string, checking_id: string, lnurl_response: null | string }> {
    let response: AxiosResponse
    try {
      response = await axios.post(`${this.lnbitsOrigin}/api/v1/payments`, {
        out: false,
        amount,
        memo,
      }, this.getAuthHeader())
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }

  public async payInvoice(invoice: string) {
    let response: AxiosResponse
    try {
      response = await axios.post(`${this.lnbitsOrigin}/api/v1/payments`, {
        out: true,
        bolt11: invoice,
      }, this.getAuthHeader())
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }

  public async getLNURLWById(lnbitsWithdrawId: string) {
    let response: AxiosResponse
    try {
      response = await axios.get(`${this.lnbitsOrigin}/withdraw/api/v1/links/${lnbitsWithdrawId}`, this.getAuthHeader())
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }

  public async withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest: LNURLWithdrawRequest, memo = '') {
    const amount = Math.floor(lnurlWithdrawRequest.maxWithdrawable / 1000)
    const invoiceData = await this.createInvoice(amount, memo)

    const invoice = invoiceData?.payment_request

    const parameterGlue = lnurlWithdrawRequest.callback.includes('?') ? '&' : '?'
    const url = `${lnurlWithdrawRequest.callback}${parameterGlue}k1=${lnurlWithdrawRequest.k1}&pr=${invoice}`

    let lnurlWithdrawResponse: AxiosResponse | null = null

    const maxRetries = 15

    try {
      lnurlWithdrawResponse = await getLnurlResponse(url, maxRetries)
    } catch (error) {
      console.error('withdraw failed multiple times, only showing last error', error)
      throw new Error(`Tried LNURLw callback link for ${maxRetries}x times: ${url}`)
    }

    return lnurlWithdrawResponse.data
  }

  public async loginWithLNURLAuth(lnurlAuth: string) {
    const url = decodeLnurl(lnurlAuth)

    let response: AxiosResponse

    const headers = this.getAuthHeader() as any
    headers.params = {
      'callback': url,
    }

    try {
      response = await axios.get(`${this.lnbitsOrigin}/api/v1/lnurlauth`, headers)
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }
}
