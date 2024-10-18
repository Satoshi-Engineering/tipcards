import axios from 'axios'
import z from 'zod'

import { Card as ZodCardApi, type Card as CardApi } from '@shared/data/api/Card.js'
import { getPaidAmount } from '@shared/data/api/cardHelpers.js'
import { ErrorWithCode, ErrorCode } from '@shared/data/Errors.js'

import type { Set } from '@backend/database/deprecated/data/Set.js'
import type { BulkWithdraw as BulkWithdrawRedis } from '@backend/database/deprecated/data/BulkWithdraw.js'
import { cardRedisFromCardApi } from '@backend/database/deprecated/transforms/cardRedisFromCardApi.js'
import { getCardByHash, createCard, updateCard, updateSet } from '@backend/database/deprecated/queries.js'
import WithdrawAlreadyUsedError from '@backend/errors/WithdrawAlreadyUsedError.js'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ADMIN_KEY, LNBITS_ORIGIN } from '@backend/constants.js'

import hashSha256 from './hashSha256.js'
import { LnbitsWithdrawLinkResponse } from './LnbitsWithdrawLinkResponse.js'

const axiosOptionsWithReadHeaders = {
  headers: {
    'Content-type': 'application/json',
    'X-Api-Key': LNBITS_INVOICE_READ_KEY,
  },
}

const axiosOptionsWithAdminHeaders = {
  headers: {
    'Content-type': 'application/json',
    'X-Api-Key': LNBITS_ADMIN_KEY,
  },
}

/**
 * Checks if the card invoice has been paid.
 *
 * Side-effects:
 *  - manipulates the given card
 *  - updates the card in the database
 *
 * @param card CardApi
 * @throws ErrorWithCode
 */
export const checkIfCardInvoiceIsPaid = async (card: CardApi): Promise<CardApi> => {
  if (card.isLockedByBulkWithdraw) {
    return card
  }

  if (
    card.lnbitsWithdrawId != null
    || card.invoice == null
    || card.invoice.paid != null
  ) {
    return card
  }
  try {
    const response = await axios.get(
      `${LNBITS_ORIGIN}/api/v1/payments/${card.invoice.payment_hash}`,
      axiosOptionsWithReadHeaders,
    )
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
    await updateCard(cardRedisFromCardApi(card))
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
 * @param card CardApi
 * @throws ErrorWithCode
 */
export const checkIfCardLnurlpIsPaid = async (card: CardApi, closeShared = false): Promise<CardApi> => {
  if (card.isLockedByBulkWithdraw) {
    return card
  }

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
    const response = await axios.get(
      `${LNBITS_ORIGIN}/lnurlp/api/v1/links/${card.lnurlp.id}`,
      axiosOptionsWithAdminHeaders,
    )
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
  const limit = 500
  let offset = 0
  while (paymentRequests.length < servedPaymentRequests) {
    try {
      const response = await axios.get(
        `${LNBITS_ORIGIN}/api/v1/payments?limit=${limit}&offset=${offset}&sortby=time&direction=desc`,
        axiosOptionsWithAdminHeaders,
      )
      if (!Array.isArray(response.data)) {
        console.error(ErrorCode.LnbitsPaymentRequestsMalformedResponse, card.cardHash, response.data)
        break
      }
      if (response.data.length === 0) {
        // if invoices are expired they get removed by lnbits/lnd garbage collection
        // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/664#note_10306
        break
      }
      const paymentsOlderThanLnurlp = response.data.some((payment) => {
        // invoices are more than 10 minutes older than the lnurlp, we can stop looking
        if (
          card.lnurlp?.created != null
          && card.lnurlp.created > payment.time + 60000
        ) {
          return true
        }
        // check if the payment belongs to the lnurlp link
        if (
          payment.extra.tag !== 'lnurlp'
          || card.lnurlp?.id == null
          || String(payment.extra.link) !== String(card.lnurlp?.id)
        ) {
          return false
        }
        // do not add payments that are already recorded
        if (card.lnurlp?.payment_hash != null && card.lnurlp.payment_hash.includes(payment.payment_hash)) {
          return false
        }
        paymentRequests.push(payment.payment_hash)
      })
      if (paymentsOlderThanLnurlp) {
        break
      }
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsPaymentRequests)
    }
    offset += limit
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
      const response = await axios.get(
        `${LNBITS_ORIGIN}/api/v1/payments/${paymentRequest}`,
        axiosOptionsWithAdminHeaders,
      )
      if (response.data.paid === true) {
        // I think this is a bug from lnbits, that it sometimes returns the (outgoing) self-payment instead of the invoice.
        // A maybe better solution would be to take the amount from the previous request (list of payments) and only check if it's paid here.
        let amountForPayment = response.data.details.amount
        if (response.data.details.checking_id.indexOf('internal') >= 0) {
          amountForPayment = Math.abs(response.data.details.amount)
        }

        amount += Math.round(amountForPayment / 1000)
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
    await updateCard(cardRedisFromCardApi(card))
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
 * @param card CardApi
 * @throws ErrorWithCode
 */
export const checkIfCardIsPaidAndCreateWithdrawId = async (card: CardApi): Promise<CardApi> => {
  if (card.isLockedByBulkWithdraw) {
    return card
  }

  await checkIfCardInvoiceIsPaid(card)
  if (card.invoice?.paid == null) {
    await checkIfCardLnurlpIsPaid(card)
  }

  const amount: number = getPaidAmount(card)
  if (amount === 0) {
    return card
  }
  try {
    const response = await axios.post(
      `${LNBITS_ORIGIN}/withdraw/api/v1/links`,
      {
        title: card.text,
        min_withdrawable: amount,
        max_withdrawable: amount,
        uses: 1,
        wait_time: 1,
        is_unique: true,
        webhook_url: `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`,
      },
      axiosOptionsWithAdminHeaders,
    )
    if (typeof response.data.id === 'string' || typeof response.data.id === 'number') {
      card.lnbitsWithdrawId = String(response.data.id)
    } else {
      throw new ErrorWithCode('Missing withdrawId after creating withdraw link at lnbits.', ErrorCode.UnableToCreateLnbitsWithdrawLink)
    }
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnableToCreateLnbitsWithdrawLink)
  }

  // remove lnurlp as soon as withdraw link is created to avoid paying more sats into a card that cannot be funded anymore
  if (card.lnurlp?.id != null) {
    try {
      await axios.delete(
        `${LNBITS_ORIGIN}/lnurlp/api/v1/links/${card.lnurlp.id}`,
        axiosOptionsWithAdminHeaders,
      )
    } catch (error) {
      // if the delete request returns 404 and has data, then the lnurlp has already been deleted (probably by lnbits)
      if (
        !axios.isAxiosError(error)
        || error.response?.status !== 404
        || error.response?.data === null
      ) {
        console.error(ErrorCode.UnableToRemoveLnurlpLink, error)
      }
    }
  }

  try {
    await updateCard(cardRedisFromCardApi(card))
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
 * @param card CardApi
 * @param persist Bool
 * @throws ErrorWithCode
 */
export const checkIfCardIsUsed = async (card: CardApi, persist = false): Promise<CardApi> => {
  if (card.used != null) {
    return card
  }
  if (card.lnbitsWithdrawId == null) {
    return card
  }

  const withdrawLinkIsUsed = await isLnbitsWithdrawLinkUsed(card.lnbitsWithdrawId)
  if (!withdrawLinkIsUsed) {
    return card
  }

  if (persist) {
    await setCardToUsed(card, new Date())
    return card
  }

  card.withdrawPending = true
  if (await lnurlwCreationHappenedInLastTwoMinutes(card.lnbitsWithdrawId)) {
    return card
  }

  const { successfulPayments, pendingPayments } = await getPaymentInfoForCard(card)
  if (successfulPayments > 0) {
    // this should not happen, as the card should be set to used after the first payment via webhook call by lnbits
    console.error(`Card ${card.cardHash} has a payment, but is not set to used. Will do so now.`)
    await setCardToUsed(card, new Date())
    return card
  }
  if (pendingPayments === 0) {
    const paidAmount: number = getPaidAmount(card)
    console.error(`Card ${card.cardHash} was funded with ${paidAmount} sats more than 2 minutes ago and there are no pending payments. Deleting + recreating lnurlw now.`)
    card.lnbitsWithdrawId = null
    card.withdrawPending = false
    await updateCard(cardRedisFromCardApi(card))
    await checkIfCardIsPaidAndCreateWithdrawId(card)
  }

  return card
}

export const isLnbitsWithdrawLinkUsed = async (lnbitsWithdrawId: string): Promise<boolean> => {
  let responseData: LnbitsWithdrawLinkResponse
  try {
    const response = await axios.get(
      `${LNBITS_ORIGIN}/withdraw/api/v1/links/${lnbitsWithdrawId}`,
      axiosOptionsWithReadHeaders,
    )
    responseData = LnbitsWithdrawLinkResponse.parse(response.data)
  } catch (error) {
    if (error instanceof ErrorWithCode) {
      throw error
    }
    throw new ErrorWithCode(error, ErrorCode.UnableToGetLnbitsWithdrawStatus)
  }
  return responseData.used > 0
}

export const lnurlwCreationHappenedInLastTwoMinutes = async (lnbitsWithdrawId: string): Promise<boolean> => {
  const lnurlwCreationTimestamp = await getLnurlwCreationTimestamp(lnbitsWithdrawId)
  if (lnurlwCreationTimestamp == null) {
    return false
  }
  return lnurlwCreationTimestamp > ((+ new Date() / 1000) - 2 * 60)
}

export const getLnurlwCreationTimestamp = async (lnbitsWithdrawId: string): Promise<number | null> => {
  let responseData: LnbitsWithdrawLinkResponse
  try {
    const response = await axios.get(
      `${LNBITS_ORIGIN}/withdraw/api/v1/links/${lnbitsWithdrawId}`,
      axiosOptionsWithReadHeaders,
    )
    responseData = LnbitsWithdrawLinkResponse.parse(response.data)
  } catch {
    return null
  }
  return responseData.open_time
}

/**
 * Checks if the cards lnurlw has a payment, does not matter if its pending or fulfilled.
 *
 * @param card CardApi
 * @throws ErrorWithCode
 */
export const getPaymentInfoForCard = async (card: CardApi): Promise<{
  successfulPayments: number,
  pendingPayments: number,
}> => {
  const paymentInfo = {
    successfulPayments: 0,
    pendingPayments: 0,
  }
  if (card.lnbitsWithdrawId == null) {
    return paymentInfo
  }

  // 1. get lnurlw creation timestamp
  const lnurlwCreationTimestamp = await getLnurlwCreationTimestamp(card.lnbitsWithdrawId)
  if (lnurlwCreationTimestamp == null) {
    return paymentInfo
  }

  // 2. query payment requests
  let oldestPaymentTime = + new Date() / 1000
  const limit = 500
  let offset = 0
  while (oldestPaymentTime > (lnurlwCreationTimestamp - 24 * 60 * 60)) {
    try {
      const response = await axios.get(
        `${LNBITS_ORIGIN}/api/v1/payments?limit=${limit}&offset=${offset}&sortby=time&direction=desc`,
        axiosOptionsWithAdminHeaders,
      )
      if (!Array.isArray(response.data)) {
        console.error(ErrorCode.LnbitsPaymentRequestsMalformedResponse, card.cardHash, response.data)
        break
      }
      if (response.data.length === 0) {
        // if invoices are expired they get removed by lnbits/lnd garbage collection
        // https://gitlab.satoshiengineering.com/satoshiengineering/projects/-/issues/664#note_10306
        break
      }
      response.data.forEach((payment) => {
        if (payment.time < oldestPaymentTime) {
          oldestPaymentTime = payment.time
        }
        if (payment.pending) {
          paymentInfo.pendingPayments += 1
        } else if (
          payment.extra?.tag === 'withdraw'
          && typeof payment.extra?.wh_response === 'string'
          && payment.extra.wh_response.includes(card.cardHash)
        ) {
          paymentInfo.successfulPayments += 1
        }
      })
    } catch (error) {
      throw new ErrorWithCode(error, ErrorCode.UnableToParseLnbitsPaymentsForCardPaymentInfo)
    }
    offset += limit
  }

  if (paymentInfo.successfulPayments > 1) {
    console.error(`More than one payment found for card ${card.cardHash}.`)
  }

  return paymentInfo
}

/** @throw */
export const setCardToUsed = async (card: CardApi, date: Date) => {
  card.used = Math.round(+ date / 1000)
  try {
    await updateCard(cardRedisFromCardApi(card))
  } catch (error) {
    throw new ErrorWithCode(error, ErrorCode.UnknownDatabaseError)
  }
}

/**
 * Checks if the card has been used.
 *
 * @param card CardApi
 * @throws
 */
export const getCardIsUsedFromLnbits = async (card: CardApi): Promise<boolean> => {
  if (card.lnbitsWithdrawId == null || card.isLockedByBulkWithdraw) {
    return false
  }
  try {
    const response = await axios.get(
      `${LNBITS_ORIGIN}/withdraw/api/v1/links/${card.lnbitsWithdrawId}`,
      axiosOptionsWithReadHeaders,
    )
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
 * @param card CardApi
 * @param shared Boolean
 * @throws
 */
export const getLnurlpForCard = async (card: CardApi, shared: undefined | boolean = undefined): Promise<unknown> => {
  if (card.isLockedByBulkWithdraw) {
    return card
  }

  let id
  if (card.lnurlp?.id != null) {
    id = String(card.lnurlp.id)
    if (typeof shared === 'boolean') {
      card.lnurlp.shared = shared
    }
  } else {
    try {
      const response = await axios.post(
        `${LNBITS_ORIGIN}/lnurlp/api/v1/links/`,
        {
          description: 'Fund your tipcard!',
          min: 210,
          max: 210000,
          webhook_url: `${TIPCARDS_API_ORIGIN}/api/lnurlp/paid/${card.cardHash}`,
        },
        axiosOptionsWithAdminHeaders,
      )
      id = String(response.data.id)
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
      expired: false,
    }
  }
  try {
    await updateCard(cardRedisFromCardApi(card))
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
  const card = ZodCardApi.parse({
    cardHash,
    text: 'Have fun with Bitcoin :)',
    invoice: null,
    lnurlp: null,
    lnbitsWithdrawId: null,
    used: null,
  })
  try {
    await createCard(cardRedisFromCardApi(card))
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
    const response = await axios.get(
      `${LNBITS_ORIGIN}/api/v1/payments/${set.invoice.payment_hash}`,
      axiosOptionsWithReadHeaders,
    )
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
      const cardHash = hashSha256(`${set.id}/${cardIndex}`)
      const card = await getCardByHash(cardHash)
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

/**
 * @throws ZodError
 * @throws AxiosError
 */
export const isBulkWithdrawWithdrawn = async (bulkWithdraw: BulkWithdrawRedis): Promise<boolean> => {
  if (bulkWithdraw.withdrawn != null) {
    return true
  }
  const response = await axios.get(
    `${LNBITS_ORIGIN}/withdraw/api/v1/links/${bulkWithdraw.lnbitsWithdrawId}`,
    axiosOptionsWithReadHeaders,
  )
  const used = z.object({ used: z.number() }).transform(({ used }) => used).parse(response.data)
  return used > 0
}

/**
 * info about deleting withdrawId:
 *  - delete just deletes the lnurl without checking if there are any uses
 *  - I cannot set the uses to 0, min 1 is allowed by the api
 *  - the payment_requests do not contain the withdraw id/link, only the info that they were created by a withdraw
 *  - the "wait_time" property is in seconds and also applies to the first withdraw, so we could use that maybe
 *  - I set the wait time to 100 years for an old withdraw, I could still use it :(
 *  - I could set the max_amount to 1 satoshi, then delete it, if it still has 0 uses (then the user can at most claim 1 satoshi)
 *
 * @throws WithdrawAlreadyUsedError
 * @throws AxiosError
 */
export const deleteWithdrawIfNotUsed = async (lnbitsWithdrawId: string, title: string, webhook_url: string) => {
  const response = await axios.put(
    `${LNBITS_ORIGIN}/withdraw/api/v1/links/${lnbitsWithdrawId}`,
    {
      title,
      min_withdrawable: 1,
      max_withdrawable: 1,
      uses: 1,
      wait_time: 1,
      is_unique: true,
      webhook_url,
    },
    axiosOptionsWithAdminHeaders,
  )
  const used = z.object({ used: z.number() }).transform(({ used }) => used).parse(response.data)
  if (used > 0) {
    throw new WithdrawAlreadyUsedError(`Lnbits withdraw ${lnbitsWithdrawId} is already used.`)
  }
  await axios.delete(`${LNBITS_ORIGIN}/withdraw/api/v1/links/${lnbitsWithdrawId}`, axiosOptionsWithAdminHeaders)
}

/**
 * @throws AxiosError
 */
export const createWithdrawLink = async (title: string, amount: number, webhook_url: string) => {
  const response = await axios.post(
    `${LNBITS_ORIGIN}/withdraw/api/v1/links`,
    {
      title,
      min_withdrawable: amount,
      max_withdrawable: amount,
      uses: 1,
      wait_time: 1,
      is_unique: true,
      webhook_url,
    },
    axiosOptionsWithAdminHeaders,
  )
  const lnbitsWithdrawId = String(response.data.id)
  const lnbitsWithdrawLnurl = response.data.lnurl
  return { lnbitsWithdrawId, lnbitsWithdrawLnurl }
}

/**
 * @param withdrawId string
 * @throws
 */
export const loadCurrentLnurlFromLnbitsByWithdrawId = async (withdrawId: string): Promise<string> => {
  const response = await axios.get(
    `${LNBITS_ORIGIN}/withdraw/api/v1/links/${withdrawId}`,
    axiosOptionsWithReadHeaders,
  )
  return response.data.lnurl.toLowerCase()
}
