import axios from 'axios'
import z from 'zod'

import type { Card } from '@shared/data/api/Card'
import LNURL from '@shared/modules/LNURL/LNURL'

import { BACKEND_API_ORIGIN, LNBITS_ORIGIN } from '@/constants'

export const CardStatusEnum = z.enum([
  'unfunded',
  'invoiceFunding', 'lnurlpFunding', 'lnurlpSharedFunding', 'setInvoiceFunding',
  'invoiceExpired', 'lnurlpExpired', 'lnurlpSharedExpiredEmpty', 'lnurlpSharedExpiredFunded', 'setInvoiceExpired',
  'funded',
  'withdrawPending', 'recentlyWithdrawn', 'withdrawn',
])

export type CardStatusEnum = z.infer<typeof CardStatusEnum>

export const CardStatus = z.object({
  lnurl: z.string(),
  status: CardStatusEnum,
  amount: z.number().nullable().default(null),
  createdDate: z.number().nullable().default(null),
  fundedDate: z.number().nullable().default(null),
  withdrawnDate: z.number().nullable().default(null),
})

export type CardStatus = z.infer<typeof CardStatus>

export const loadCard = async (cardHash: string): Promise<Card> => {
  const url = `${BACKEND_API_ORIGIN}/api/card/${cardHash}`
  try {
    const response = await axios.get(
      url,
      {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      },
    )
    return response.data.data as Card
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return {
        cardHash,
        invoice: null,
        lnurlp: null,
        lnbitsWithdrawId: null,
        used: null,
        text: '',
        note: '',
        setFunding: null,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        withdrawPending: false,
      }
    }
    console.error(error)
    throw error
  }
}

/**
 * @deprecated use @shared/data/Card/CardStatus instead
 */
export type CardStatusDeprecated = {
  status: 'error' | 'unfunded' | 'funded' | 'used' | 'invoice' | 'lnurlp' | 'setFunding'
  amount?: number
  shared?: boolean
  createdDate?: number,
  fundedDate?: number,
  message?: string // a message intended for the user
  card?: Card
}

export const loadCardStatusForLnurl = async (lnurl: string): Promise<CardStatusDeprecated> => {
  let lnurlDecoded: URL
  try {
    lnurlDecoded = new URL(LNURL.decode(lnurl))
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

export const loadCardStatus = async (cardHash: string): Promise<CardStatusDeprecated> => {
  let card: Card | null
  try {
    card = await loadCard(cardHash)
  } catch {
    return {
      status: 'error',
      message: 'Unable to load the TipCard status as the server is currently not reachable. Please try again later.',
    }
  }
  if (card == null) {
    return {
      status: 'unfunded',
      shared: false,
    }
  }

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
    shared = card.lnurlp.shared || false
    createdDate = card.lnurlp.created
    fundedDate = card.lnurlp.paid != null ? card.lnurlp.paid : undefined
  } else if (card.setFunding != null) {
    amount = card.setFunding.amount
    createdDate = card.setFunding.created
    fundedDate = card.setFunding.paid != null ? card.setFunding.paid : undefined
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
  if (card.lnbitsWithdrawId != null || card.isLockedByBulkWithdraw) {
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
  if (card.setFunding != null && card.setFunding.paid == null) {
    return {
      status: 'setFunding',
      amount,
      shared,
      createdDate,
      fundedDate,
      card,
    }
  }
  return {
    status: 'unfunded',
    fundedDate,
    card,
  }
}

export const getCardStatusForCard = (card: Card): CardStatus => {
  const lnurlDecoded = `${BACKEND_API_ORIGIN}/api/lnurl/${card.cardHash}`
  const lnurl = LNURL.encode(lnurlDecoded)

  let status: CardStatusEnum = CardStatusEnum.enum.unfunded
  let amount: number | null = null
  let createdDate: number | null = null
  let fundedDate: number | null = null
  let withdrawnDate: number | null = null

  if (card.invoice != null) {
    status = card.invoice.expired ? 'invoiceExpired' : 'invoiceFunding'
    amount = card.invoice.amount
    createdDate = card.invoice.created
    fundedDate = card.invoice.paid != null ? card.invoice.paid : null
  } else if (card.lnurlp != null) {
    status = card.lnurlp.expired ? 'lnurlpExpired' : 'lnurlpFunding'
    amount = card.lnurlp.amount != null ? card.lnurlp.amount : null
    createdDate = card.lnurlp.created
    fundedDate = card.lnurlp.paid != null ? card.lnurlp.paid : null
    if (card.lnurlp.shared) {
      status = card.lnurlp.expired
        ? amount != null && amount > 0 ? 'lnurlpSharedExpiredFunded' : 'lnurlpSharedExpiredEmpty'
        : 'lnurlpSharedFunding'
    }
  } else if (card.setFunding != null) {
    status = card.setFunding.expired ? 'setInvoiceExpired' : 'setInvoiceFunding'
    amount = card.setFunding.amount
    createdDate = card.setFunding.created
    fundedDate = card.setFunding.paid != null ? card.setFunding.paid : null
  }

  if (fundedDate != null) {
    status = 'funded'
  }
  if (card.withdrawPending) {
    status = 'withdrawPending'
  }
  if (card.used != null) {
    withdrawnDate = card.used
    status = (+ new Date() / 1000) - withdrawnDate < 5 * 60 ? 'recentlyWithdrawn' : 'withdrawn'
  }

  return {
    lnurl,
    status,
    amount,
    createdDate,
    fundedDate,
    withdrawnDate,
  }
}
