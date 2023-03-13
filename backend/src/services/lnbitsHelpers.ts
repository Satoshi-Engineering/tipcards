import axios from 'axios'

import { getCardByHash, createCard, updateCard, updateSet } from './database'
import hashSha256 from './hashSha256'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY } from '../constants'
import type { Card } from '../../../src/data/Card'
import type { Set } from '../../../src/data/Set'
import { ErrorWithCode, ErrorCode } from '../../../src/data/Errors'
import { LNBITS_ORIGIN } from '../../../src/constants'

/**
 * Checks if the card invoice has been paid.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 * @throws ErrorWithCode
 */
export const checkIfCardInvoiceIsPaid = async (card: Card): Promise<Card> => {
  if (
    card.lnbitsWithdrawId != null
    || card.invoice == null
    || card.invoice.paid != null
  ) {
    return card
  }
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
    // if the invoice doesnt exist anymore handle the expired invoice in the frontend
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        card.invoice.expired = true
        return card
      }
    }
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsInvoiceStatus)
  }
  try {
    await updateCard(card)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  return card
}

/**
 * Checks if the card lnurlp has been paid.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 * @throws ErrorWithCode
 */
export const checkIfCardLnurlpIsPaid = async (card: Card, closeShared = false): Promise<Card> => {
  if (
    card.lnbitsWithdrawId != null
    || card.lnurlp == null
    || card.lnurlp.paid != null
  ) {
    return card
  }

  // 1. check if payment requests were created
  let servedPaymentRequests: number
  try {
    const response = await axios.get(`${LNBITS_ORIGIN}/lnurlp/api/v1/links/${card.lnurlp.id}`, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_ADMIN_KEY,
      },
    })
    if (response.data.served_pr === 0) {
      return card
    }
    servedPaymentRequests = response.data.served_pr
  } catch (error) {
    // if the pay link doesnt exist anymore handle the expired lnurlp in the frontend
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        card.lnurlp.expired = true
        return card
      }
    }
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsLnurlpStatus)
  }
  // 1.a remove the payments that are already registered
  if (card.lnurlp.payment_hash != null) {
    servedPaymentRequests -= card.lnurlp.payment_hash.length
  }

  // 2. query payment requests for lnurlp
  const paymentRequests: string[] = []
  let offset = 0
  while (paymentRequests.length < servedPaymentRequests) {
    try {
      const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments?limit=20&offset=${offset}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_ADMIN_KEY,
        },
      })
      if (Array.isArray(response.data)) {
        response.data.forEach((payment) => {
          // do not add payments that are already recorded
          if (card.lnurlp?.payment_hash != null && card.lnurlp.payment_hash.includes(payment.payment_hash)) {
            return
          }
          if (payment.extra.tag === 'lnurlp' && payment.extra.link === card.lnurlp?.id) {
            paymentRequests.push(payment.payment_hash)
          }
        })
      }
      // check at least 200 payment requests
      if (offset > 10) {
        break
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsPaymentRequests)
    }
    offset += 1
  }

  // 3. check if a payment request was paid
  let amount = card.lnurlp?.amount != null ? card.lnurlp.amount : 0
  const payment_hash: string[] = card.lnurlp?.payment_hash != null ? card.lnurlp.payment_hash : []
  while (paymentRequests.length > 0) {
    const paymentRequest = paymentRequests.shift()
    if (paymentRequest == null) {
      break
    }
    try {
      const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments/${paymentRequest}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_ADMIN_KEY,
        },
      })
      if (response.data.paid === true) {
        amount += Math.round(response.data.details.amount / 1000)
        payment_hash.push(response.data.details.payment_hash)
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsInvoiceStatus)
    }
  }
  if (amount > 0) {
    card.lnurlp.amount = amount
    card.lnurlp.payment_hash = payment_hash

    if (!card.lnurlp.shared || closeShared) {
      card.lnurlp.paid = Math.round(+ new Date() / 1000)
    }
  }

  try {
    await updateCard(card)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  return card
}

/**
 * Checks if the card invoice has been funded (via invoice or lnurlp). If so, creates a withdraw link at lnbits.
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card 
 * @throws ErrorWithCode
 */
export const checkIfCardIsPaidAndCreateWithdrawId = async (card: Card): Promise<Card> => {
  await checkIfCardInvoiceIsPaid(card)
  if (card.invoice?.paid == null) {
    await checkIfCardLnurlpIsPaid(card)
  }

  let amount: number | undefined = undefined
  if (card.invoice?.paid != null) {
    amount = card.invoice.amount
  } else if (card.lnurlp?.paid != null && card.lnurlp.amount != null) {
    amount = card.lnurlp.amount
  } else if (card.setFunding?.paid != null) {
    amount = card.setFunding.amount
  }
  if (amount == null) {
    return card
  }
  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links`, {
      title: card.text,
      min_withdrawable: amount,
      max_withdrawable: amount,
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

  // remove lnurlp as soon as withdraw link is created to avoid paying more sats into a card that cannot be funded anymore
  if (card.lnurlp?.id != null) {
    try {
      await axios.delete(`${LNBITS_ORIGIN}/lnurlp/api/v1/links/${card.lnurlp.id}`, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_ADMIN_KEY,
        },
      })
    } catch (error) {
      console.error(ErrorCode.UnableToRemoveLnurlpLink, error)
    }
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
 * @param persist Bool
 * @throws
 */
export const checkIfCardIsUsed = async (card: Card, persist = false): Promise<Card> => {
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
      if (persist) {
        card.used = Math.round(+ new Date() / 1000)
      } else {
        card.withdrawPending = true
      }
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsWithdrawStatus)
  }
  if (card.used == null || !persist) {
    return card
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
 * @param card Card
 * @throws
 */
export const getCardIsUsedFromLnbits = async (card: Card): Promise<boolean> => {
  if (card.lnbitsWithdrawId == null) {
    return false
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
      return true
    } else {
      return false
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsWithdrawStatus)
  }
}

/**
 * Creates lnurlp for a card.
 * 
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 * 
 * @param card Card
 * @param shared Boolean
 * @throws
 */
export const getLnurlpForCard = async (card: Card, shared: undefined | boolean = undefined): Promise<unknown> => {
  let id
  if (card.lnurlp?.id != null) {
    id = card.lnurlp.id
    if (typeof shared === 'boolean') {
      card.lnurlp.shared = shared
    }
  } else {
    try {
      const response = await axios.post(`${LNBITS_ORIGIN}/lnurlp/api/v1/links/`, {
        description: 'Fund your tipcard!',
        min: 210,
        max: 210000,
        webhook_url: `${TIPCARDS_API_ORIGIN}/api/lnurlp/paid/${card.cardHash}`,
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
    card.invoice = null
    card.lnurlp = {
      shared: typeof shared === 'boolean' ? shared : false,
      amount: null,
      payment_hash: null,
      id,
      created: Math.round(+ new Date() / 1000),
      paid: null,
    }
  }
  try {
    await updateCard(card)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }

  try {
    const response = await axios.get(`${LNBITS_ORIGIN}/lnurlp/api/v1/lnurl/${id}`)
    return response.data
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnurlP)
  }
}

export const getLnurlpForNewCard = async (cardHash: string, shared = false): Promise<unknown> => {
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
  return getLnurlpForCard(card, shared)
}

/**
 * Checks if the set invoice has been paid.
 * 
 * Side-effects:
 *  - manipulates the given set
 *  - updates the set and cards (specified in set.invoice.fundedCards) in the database
 * 
 * @param set Set
 * @throws ErrorWithCode
 */
export const checkIfSetInvoiceIsPaid = async (set: Set): Promise<Set> => {
  if (
    set.invoice == null
    || set.invoice.paid != null
  ) {
    return set
  }
  try {
    const response = await axios.get(`${LNBITS_ORIGIN}/api/v1/payments/${set.invoice.payment_hash}`, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_INVOICE_READ_KEY,
      },
    })
    if (typeof response.data.paid !== 'boolean') {
      throw new ErrorWithCode('Missing paid status when checking invoice status at lnbits.', ErrorCode.UnableToGetLnbitsInvoiceStatus)
    }
    if (response.data.paid === true) {
      set.invoice.paid = Math.round(+ new Date() / 1000)
    }
  } catch (error) {
    // if the invoice doesnt exist anymore handle the expired invoice in the frontend
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        set.invoice.expired = true
        return set
      }
    }
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsInvoiceStatus)
  }
  if (set.invoice.paid == null) {
    return set
  }

  try {
    // update all cards -> paid
    await Promise.all(set.invoice.fundedCards.map(async (cardIndex) => {
      const cardHash = await hashSha256(`${set.id}/${cardIndex}`)
      const card: Card | null = await getCardByHash(cardHash)
      if (card?.setFunding == null) {
        return
      }
      card.setFunding.paid = Math.round(+ new Date() / 1000)
      await updateCard(card)
    }))

    // update set -> paid
    await updateSet(set)
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
  return set
}
