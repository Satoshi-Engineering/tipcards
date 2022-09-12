import axios from 'axios'
import type { LNURLWithdrawParams } from 'js-lnurl'

export type CardStatus = {
  status: 'ERROR' | 'unfunded' | 'funded' | 'used'
  message?: string,
  sats: number | null,
}

export default async (lnurlDecoded: string): Promise<CardStatus> => {
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
        sats: null,
      }
    }
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
    console.error(error)
    return {
      status: 'ERROR',
      message: 'Unknown error for LNURL.',
      sats: null,
    }
  }
  return {
    sats: lnurlContent.minWithdrawable / 1000,
    status: 'funded',
  }
}
