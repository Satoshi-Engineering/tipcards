import axios from 'axios'
import { decodelnurl } from 'js-lnurl'

import { BACKEND_API_ORIGIN } from '@/constants'
import type { Card } from '@root/data/Card'
import type { SuccessResponse } from '@root/data/Response'
import { LNBITS_ORIGIN } from '@root/constants'

export type CardStatus = {
  status: 'error' | 'unfunded' | 'funded' | 'used'
  message?: string // a message intended for the user
  card?: Card
}

export const loadCardStatusForLnurl = async (lnurl: string): Promise<CardStatus> => {
  let lnurlDecoded: URL
  try {
    lnurlDecoded = new URL(decodelnurl(lnurl))
  } catch (error) {
    console.error(error)
    return {
      status: 'error',
      message: 'Sorry, the provided LNURL is invalid.',
    }
  }

  if (lnurlDecoded.origin !== BACKEND_API_ORIGIN && lnurlDecoded.origin !== LNBITS_ORIGIN) {
    console.error(`LNURL points to a foreign origin: ${lnurlDecoded.origin}`)
    return {
      status: 'error',
      message: 'Sorry, the provided LNURL cannot be used on this website.',
    }
  }

  const cardHashMatch = lnurlDecoded.pathname.match(/\/api\/lnurl\/([a-z0-9]*)/)
  if (cardHashMatch == null) {
    return {
      status: 'error',
      message: 'Sorry, the provided LNURL is invalid.',
    }
  }
  return loadCardStatus(cardHashMatch[1])
}

export const loadCardStatus = async (cardHash: string): Promise<CardStatus> => {
  let cardResponse: SuccessResponse
  try {
    const response = await axios.get(
      `${BACKEND_API_ORIGIN}/api/card/${cardHash}`,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    cardResponse = response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        status: 'unfunded',
      }
    }
    console.error(error)
    return {
      status: 'error',
      message: 'Unable to load card info.',
    }
  }
  const card = cardResponse.data as Card
  if (card.lnbitsWithdrawId == null) {
    return {
      status: 'unfunded',
      card,
    }
  }
  if (card.used != null) {
    return {
      status: 'used',
      card,
    }
  }
  return {
    status: 'funded',
    card,
  }
}
