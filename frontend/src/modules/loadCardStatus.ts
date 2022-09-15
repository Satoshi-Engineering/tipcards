import axios from 'axios'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'

import { BACKEND_API_ORIGIN } from '@/constants'
import { LNBITS_ORIGIN } from '@root/constants'

export type CardStatus = {
  status: 'ERROR' | 'unfunded' | 'funded' | 'used'
  message?: string,
  sats?: number | null,
  invoicePaymentRequest?: string | null,
  invoiceCreated?: number | null,
  invoicePaid?: number | null,
  cardUsed?: number | null,
}

// merged response data from "tipcards backend api" and "lnbits api"
export type ErrorResponseData = {
  status: 'ERROR'
  code: string
  reason?: string
  detail?: string
  data?: {
    amount: number | undefined
    invoicePaymentRequest: string | undefined
    invoiceCreated: number | undefined
    invoicePaid: number | null | undefined
    cardUsed: number | null | undefined
  }
}

export default async (lnurl: string): Promise<CardStatus> => {
  let lnurlDecoded: URL | undefined
  try {
    lnurlDecoded = new URL(decodelnurl(lnurl))
  } catch (error) {
    console.error(error)
    return {
      status: 'ERROR',
      message: 'Sorry, the provided LNURL is invalid.',
    }
  }

  if (lnurlDecoded.origin !== BACKEND_API_ORIGIN && lnurlDecoded.origin !== LNBITS_ORIGIN) {
    console.error(`LNURL points to a foreign origin: ${lnurlDecoded.origin}`)
    return {
      status: 'ERROR',
      message: 'Sorry, the provided LNURL cannot be used on this website.',
    }
  }

  let lnurlContent: LNURLWithdrawParams
  try {
    const response = await axios.get(
      new URL(lnurlDecoded).href,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    lnurlContent = response.data
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.data == null) {
      console.error(error)
      return {
        status: 'ERROR',
        message: 'Error when trying to load LNURL content.',
      }
    }
    const responseData = error.response.data as ErrorResponseData
    if (responseData.code === 'CardByHashNotFound' || responseData.code === 'CardNotFunded') {
      return {
        status: 'unfunded',
        sats: responseData.data?.amount,
        invoicePaymentRequest: responseData.data?.invoicePaymentRequest,
      }
    }
    if (responseData.code === 'WithdrawHasBeenSpent') {
      return {
        status: 'used',
        sats: responseData.data?.amount,
        cardUsed: responseData.data?.cardUsed,
      }
    }
    if (['Withdraw is spent.', 'LNURL-withdraw not found.'].includes(String(responseData.detail))) {
      return {
        status: 'used',
        sats: null,
      }
    }
    console.error(error)
    return {
      status: 'ERROR',
      message: 'Unknown error for LNURL.',
    }
  }
  if (lnurlContent.tag !== 'withdrawRequest') {
    return {
      status: 'ERROR',
      message: 'Sorry, this website does not support the provided type of LNURL.',
    }
  }
  return {
    status: 'funded',
    sats: lnurlContent.minWithdrawable / 1000,
  }
}
