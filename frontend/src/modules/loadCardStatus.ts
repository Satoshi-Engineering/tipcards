import axios from 'axios'
import { decodelnurl, type LNURLWithdrawParams } from 'js-lnurl'

import { BACKEND_API_ORIGIN } from '@/constants'
import { LNBITS_ORIGIN } from '@root/constants'

export type CardStatus = {
  status: 'ERROR' | 'unfunded' | 'funded' | 'used'
  message?: string,
  sats?: number | null,
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
    // response.data contains a property `code` if if the LNURL points to the tipcards backend
    const responseCode = (error.response.data as { code: string }).code
    if (responseCode === 'CardByHashNotFound') {
      return {
        status: 'unfunded',
        sats: null,
      }
    }
    if (responseCode === 'WithdrawHasBeenSpent') {
      return {
        status: 'used',
        sats: (error.response.data as ({ data: { amount: number}})).data.amount,
      }
    }
    // response.data contains a property `detail` if the LNURL points to lnbits
    const responseDetail = (error.response?.data as { detail: string }).detail
    if (['Withdraw is spent.', 'LNURL-withdraw not found.'].includes(responseDetail)) {
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
