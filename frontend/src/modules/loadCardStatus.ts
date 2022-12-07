import axios from 'axios'

import { decodeLnurl } from '@/modules//lnurlHelpers'
import { BACKEND_API_ORIGIN } from '@/constants'
import type { Card } from '@root/data/Card'
import type { SuccessResponse } from '@root/data/Response'
import { LNBITS_ORIGIN } from '@root/constants'

export type CardStatus = {
  status: 'error' | 'unfunded' | 'funded' | 'used' | 'invoice' | 'lnurlp'
  amount?: number
  shared?: boolean
  createdDate?: number,
  fundedDate?: number,
  message?: string // a message intended for the user
  card?: Card
}

export const loadCardStatusForLnurl = async (lnurl: string): Promise<CardStatus> => {
  let lnurlDecoded: URL
  try {
    lnurlDecoded = new URL(decodeLnurl(lnurl))
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
        shared: false,
      }
    }
    console.error(error)
    return {
      status: 'error',
      message: 'Unable to load the Tip Card status as the server is currently not reachable. Please try again later.',
    }
  }
  const card = cardResponse.data as Card

  let amount
  let shared = false
  let createdDate
  let fundedDate
  if (card.invoice != null) {
    amount = card.invoice.amount
    createdDate = card.invoice.created
    fundedDate = card.invoice.paid != null ? card.invoice.paid : undefined
  } else if (card.lnurlp != null) {
    amount = card.lnurlp.amount != null ? card.lnurlp.amount : undefined
    shared = card.lnurlp.shared || card.lnurlp.multi || false
    createdDate = card.lnurlp.created
    fundedDate = card.lnurlp.paid != null ? card.lnurlp.paid : undefined
  }
  
  if (card.used != null) {
    return {
      status: 'used',
      amount,
      shared,
      createdDate,
      fundedDate,
      card,
    }
  }
  if (card.lnbitsWithdrawId != null) {
    return {
      status: 'funded',
      amount,
      shared,
      createdDate,
      fundedDate,
      card,
    }  
  }
  if (card.invoice != null && card.invoice.paid == null) {
    return {
      status: 'invoice',
      amount: card.invoice.amount,
      shared,
      createdDate,
      fundedDate,
      card,
    }
  }
  if (card.lnurlp != null && card.lnurlp.paid == null) {
    return {
      status: 'lnurlp',
      amount: card.lnurlp.amount != null ? card.lnurlp.amount : undefined,
      shared,
      createdDate,
      fundedDate,
      card,
    }
  }
  return {
    status: 'unfunded',
    card,
  }
}
