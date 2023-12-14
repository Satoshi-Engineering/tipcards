import axios, { AxiosResponse } from 'axios'
import * as bech32 from 'bech32'

const LNURL_RULES = {
  prefix: 'lnurl',
  limit: 1023,
}

export class LNBitsWallet {
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

  public async decodeLNURL(LNURL: string) {
    LNURL = LNURL.toLowerCase()

    // Decode the LNURL using bech32
    const decoded = bech32.bech32.decode(LNURL, LNURL_RULES.limit)

    // Extract the LNURLp parameters from the decoded data
    return Buffer.from(bech32.bech32.fromWords(decoded.words)).toString('utf8')
  }

  public async withdrawAllFromLNURLW(LNURLw: string, memo = '') {
    const lnurlwURL = await this.decodeLNURL(LNURLw)

    let lnurlwInfoResponse: AxiosResponse
    try {
      lnurlwInfoResponse = await axios.get(lnurlwURL)
    } catch (error) {
      console.error(error)
      throw error
    }

    const amount = Math.floor(lnurlwInfoResponse.data.maxWithdrawable / 1000)
    const invoiceData = await this.createInvoice(amount, memo)

    const invoice = invoiceData?.payment_request

    const parameterGlue = lnurlwInfoResponse.data.callback.includes('?') ? '&' : '?'
    const url = `${lnurlwInfoResponse.data.callback}${parameterGlue}k1=${lnurlwInfoResponse.data.k1}&pr=${invoice}`

    let lnurlWithdrawResponse: AxiosResponse
    try {
      lnurlWithdrawResponse = await axios.get(url)
    } catch (error) {
      console.error(error)
      throw error
    }

    return lnurlWithdrawResponse.data
  }
}
