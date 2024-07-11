import axios, { AxiosResponse } from 'axios'

import { LNURLPayRequest } from '@shared/modules/LNURL/models/LNURLPayRequest.js'
import { LNURLWithdrawRequest } from '@shared/modules/LNURL/models/LNURLWithdrawRequest.js'
import LNURL from '@shared/modules/LNURL/LNURL.js'
import LNURLw from '@shared/modules/LNURL/LNURLw.js'
import { retryGetRequestWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/axiosUtils.js'

export default class LNBitsWallet {
  adminKey: string
  lnbitsOrigin: string

  constructor(lnbitsOrigin: string, adminKey: string) {
    this.adminKey = adminKey
    this.lnbitsOrigin = lnbitsOrigin
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

  public async withdrawAllFromLnurlW(lnurl: string) {
    const response = await axios.get(LNURL.decode(lnurl))
    const lnurlWithdrawRequest = LNURLWithdrawRequest.parse(response.data)
    return await this.withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest)
  }

  public async payToLnurlP(lnurl: string, amountInMilliSats?: number) {
    const payRequest = await this.getPayRequestFromLnurl(lnurl)
    const invoice = await this.createInvoiceFromPayRequest(payRequest, amountInMilliSats)
    return await this.payInvoice(invoice)
  }

  public async getPayRequestFromLnurl(lnurl: string) {
    const { data } = await axios.get(LNURL.decode(lnurl))
    return LNURLPayRequest.parse(data)
  }

  public async createInvoiceFromPayRequest(payRequest: LNURLPayRequest, amountInMilliSats?: number) {
    if (amountInMilliSats == null) {
      amountInMilliSats = payRequest.minSendable
    }
    const url = new URL(payRequest.callback)
    url.searchParams.append('amount', String(amountInMilliSats))
    const { data } = await axios.get(url.href)
    return data.pr
  }

  public async withdrawAllFromLNURLWithdrawRequest(lnurlWithdrawRequest: LNURLWithdrawRequest, memo = '') {
    const amount = Math.floor(lnurlWithdrawRequest.maxWithdrawable / 1000)
    const invoiceData = await this.createInvoice(amount, memo)

    const invoice = invoiceData?.payment_request || ''
    const url = LNURLw.createCallbackUrl(lnurlWithdrawRequest, invoice)

    let lnurlWithdrawResponse: AxiosResponse | null = null

    const maxRetries = 15

    try {
      lnurlWithdrawResponse = await retryGetRequestWithDelayUntilSuccessWithMaxAttempts(url, maxRetries)
    } catch (error) {
      console.error('withdraw failed multiple times, only showing last error', error)
      throw new Error(`Tried LNURLw callback link for ${maxRetries}x times: ${url}`)
    }

    return lnurlWithdrawResponse.data
  }

  public async loginWithLNURLAuth(lnurlAuth: string) {
    const url = LNURL.decode(lnurlAuth)

    let response: AxiosResponse

    try {
      response = await axios.post(`${this.lnbitsOrigin}/api/v1/lnurlauth`,{
        callback: url,
      }, this.getAuthHeader())
    } catch (error) {
      console.error(error)
      throw error
    }

    return response.data
  }

  private getAuthHeader() {
    return {
      headers: {
        'X-Api-Key': this.adminKey,
      },
    }
  }
}
