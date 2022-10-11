import axios from 'axios'

import { createCard, updateCard } from './database'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY } from '../constants'
import type { Card } from '../../../src/data/Card'
import { ErrorWithCode, ErrorCode } from '../../../src/data/Errors'
import { LNBITS_ORIGIN } from '../../../src/constants'

/**
 * Checks if the card invoice has been paid. If so, creates a withdraw link at lnbits.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 * @throws
 */
export const checkIfCardInvoiceIsPaidAndCreateWithdrawId = async (card: Card): Promise<Card> => {
  if (card.lnbitsWithdrawId != null || card.invoice == null) {
    return card
  }
  if (card.invoice.paid == null) {
    try {
      const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments/${card.invoice.payment_hash}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_INVOICE_READ_KEY,
        },
      })
      if (typeof response.data.paid !== 'boolean') {
        throw new ErrorWithCode('Missing paid status when checking invoice status at lnbits.', ErrorCode.UnableToGetLnbitsInvoiceStatus)
      }
      if (response.data.paid === true) {
        card.invoice.paid = Math.round(+ new Date() / 1000)
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsInvoiceStatus)
    }
  }
  if (card.invoice.paid == null) {
    return card
  }

  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links`, {
      title: card.text,
      min_withdrawable: card.invoice.amount,
      max_withdrawable: card.invoice.amount,
      uses: 1,
      wait_time: 1,
      is_unique: true,
      webhook_url: `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`,
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY,
      },
    })
    if (typeof response.data.id === 'string') {
      card.lnbitsWithdrawId = response.data.id
    } else {
      throw new ErrorWithCode('Missing withdrawId after creating withdraw link at lnbits.', ErrorCode.UnableToCreateLnbitsWithdrawLink)
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToCreateLnbitsWithdrawLink)
  }
  try {
    await updateCard(card)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  return card
}

/**
 * Checks if the card has been used.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 * @throws
 */
export const checkIfCardIsUsed = async (card: Card): Promise<Card> => {
  if (card.lnbitsWithdrawId == null || card.used != null) {
    return card
  }
  try {
    const response = await axios.get(`${LNBITS_ORIGIN}/withdraw/api/v1/links/${card.lnbitsWithdrawId}`, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_INVOICE_READ_KEY,
      },
    })
    if (typeof response.data.used !== 'number') {
      throw new ErrorWithCode('Missing used count when checking withdraw status at lnbits.', ErrorCode.UnableToGetLnbitsWithdrawStatus)
    }
    if (response.data.used > 0) {
      card.used = Math.round(+ new Date() / 1000)
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsWithdrawStatus)
  }
  if (card.used == null) {
    return card
  }

  try {
    await updateCard(card)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  return card
}

export const getLnurlpForCard = async (card: Card): Promise<unknown> => {
  let id
  if (card.lnurlp?.id != null) {
    id = card.lnurlp.id
  } else {
    try {
      const response = await axios.post(`${LNBITS_ORIGIN}/lnurlp/api/v1/links/`, {
        description: 'Fund your tipcard!',
        min: 210,
        max: 210000,
        webhook_url: `${TIPCARDS_API_ORIGIN}/api/lnurl/paid/${card.cardHash}`,
      }, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_ADMIN_KEY,
        },
      })
      id = response.data.id
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToCreateLnurlP)
    }
    card.lnurlp = {
      id,
      created: Math.round(+ new Date() / 1000),
      paid: null,
    }
    try {
      await updateCard(card)
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
    }
  }

  try {
    const response = await axios.get(`${LNBITS_ORIGIN}/lnurlp/api/v1/lnurl/${id}`)
    return response.data
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnurlP)
  }
}

export const getLnurlpForNewCard = async (cardHash: string): Promise<unknown> => {
  const card: Card = {
    cardHash,
    text: 'Have fun with Bitcoin :)',
    invoice: null,
    lnurlp: null,
    lnbitsWithdrawId: null,
    used: null,
  }
  try {
    await createCard(card)
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    throw error
  }
  return getLnurlpForCard(card)
}
