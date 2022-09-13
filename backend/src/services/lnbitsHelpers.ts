import axios from 'axios'

import type { Card } from '../data/Card'
import { ErrorWithCode, ErrorCode } from '../data/Errors'
import { updateCard } from './database'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY } from '../constants'
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
      webhook: `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`,
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
export const checkIfCardIsUed = async (card: Card): Promise<Card> => {
  if (card.used != null) {
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
