import type z from 'zod'

import { Card } from '@shared/data/trpc/Card.js'
import LNURL from '@shared/modules/LNURL/LNURL.js'

import type { Card as CardRedis } from '@backend/database/deprecated/data/Card.js'
import { cardApiFromCardRedis } from '@backend/database/deprecated/transforms/cardApiFromCardRedis.js'
import { checkIfCardIsUsed, checkIfCardInvoiceIsPaid, checkIfCardLnurlpIsPaid } from '@backend/services/lnbitsHelpers.js'
import { TIPCARDS_API_ORIGIN } from '@backend/constants.js'

type Amount = z.infer<typeof Card.shape.amount>

/**
 * @throws ZodError
 * @throws ErrorWithCode
 */
export const cardFromCardRedis = async (card: CardRedis) => Card.parse({
  hash: card.cardHash,
  created: mapCreated(card),
  shared: card.lnurlp?.shared,
  landingPageViewed: card.landingPageViewed != null ? new Date(card.landingPageViewed * 1000) : undefined,
  textForWithdraw: card.text,
  noteForStatusPage: card.note,

  lnurl: LNURL.encode(`${TIPCARDS_API_ORIGIN}/api/lnurl/${card.cardHash}`),
  invoice: await mapInvoice(card),
  lnurlp: await mapLnurlp(card),
  amount: mapAmount(card),
  funded: mapFunded(card),
  isLockedByBulkWithdraw: !!card.isLockedByBulkWithdraw,
  withdrawPending: await isWithdrawPending(card),
  withdrawn: mapWithdrawn(card),
})

const mapCreated = (card: CardRedis) => {
  let created = new Date()
  if (card.invoice != null) {
    created = new Date(card.invoice.created * 1000)
  } else if (card.lnurlp != null) {
    created = new Date(card.lnurlp.created * 1000)
  } else if (card.setFunding != null) {
    created = new Date(card.setFunding.created * 1000)
  }
  return created
}

const mapInvoice = async (card: CardRedis) => {
  if (card.invoice != null) {
    const cardApi = await checkIfCardInvoiceIsPaid(cardApiFromCardRedis(card))
    return {
      isSet: false,
      expired: !!cardApi.invoice?.expired,
    }
  } else if (card.setFunding != null) {
    return {
      isSet: true,
      expired: false,
    }
  }
  return undefined
}

const mapLnurlp = async (card: CardRedis) => {
  if (card.lnurlp == null) {
    return undefined
  }
  const cardApi = await checkIfCardLnurlpIsPaid(cardApiFromCardRedis(card))
  return {
    expired: !!cardApi.lnurlp?.expired,
  }
}

const mapAmount = (card: CardRedis) => {
  const amount: Amount = {
    pending: null,
    funded: null,
  }
  if (card.invoice != null) {
    if (card.invoice.paid) {
      amount.funded = card.invoice.amount
    } else {
      amount.pending = card.invoice.amount
    }
  } else if (card.lnurlp?.amount != null) {
    amount.funded = card.lnurlp.amount
  } else if (card.setFunding != null) {
    if (card.setFunding.paid) {
      amount.funded = card.setFunding.amount
    } else {
      amount.pending = card.setFunding.amount
    }
  }
  return amount
}

const isWithdrawPending = async (card: CardRedis) => {
  if (!isFunded(card) || isWithdrawn(card)) {
    return false
  }
  const cardApi = cardApiFromCardRedis(card)
  await checkIfCardIsUsed(cardApi)
  return cardApi.withdrawPending
}

const mapFunded = (card: CardRedis) => {
  let funded = undefined
  if (card.invoice?.paid != null) {
    funded = new Date(card.invoice.paid * 1000)
  } else if (card.lnurlp?.paid != null) {
    funded = new Date(card.lnurlp.paid * 1000)
  } else if (card.setFunding?.paid != null) {
    funded = new Date(card.setFunding.paid * 1000)
  }
  return funded
}

const isFunded = (card: CardRedis) => mapFunded(card) != null

const mapWithdrawn = (card: CardRedis) => card.used != null ? new Date(card.used * 1000) : undefined

const isWithdrawn = (card: CardRedis) => mapWithdrawn(card) != null
