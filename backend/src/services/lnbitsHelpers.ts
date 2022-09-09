import axios from 'axios'

import type { Card } from '../data/Card'
import { ErrorWithCode, ErrorCode } from '../data/Errors'
import { updateCard } from './database'
import { LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY } from '../constants'
import { LNBITS_ORIGIN } from '../../../src/constants'

/**
 * Checks if the card invoice has been paid. If so, creates a withdraw link at lnbits.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 */
export const checkIfCardInvoiceIsPaidAndCreateWithdrawId = async (card: Card): Promise<Card> => {
  if (!card.invoice.paid) {
    try {
      const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments/${card.invoice.payment_hash}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_INVOICE_READ_KEY,
        },
      })
      if (typeof response.data.paid === 'boolean') {
        card.invoice.paid = response.data.paid
      } else {
        throw new Error('Missing paid status when checking invoice status at lnbits.')
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsInvoiceStatus)
    }
  }
  if (!card.invoice.paid) {
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
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY,
      },
    })
    if (typeof response.data.id === 'string') {
      card.lnbitsWithdrawId = response.data.id
    } else {
      throw new Error('Missing withdrawId after creating withdraw link at lnbits.')
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
