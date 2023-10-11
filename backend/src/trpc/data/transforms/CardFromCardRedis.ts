import type z from 'zod'

import { Card as CardApi } from '../../../../../src/data/api/Card'
import { Card as CardRedis } from '../../../../../src/data/redis/Card'
import { encodeLnurl } from '../../../../../src/modules/lnurlHelpers'

import { checkIfCardIsUsed, checkIfCardInvoiceIsPaid, checkIfCardLnurlpIsPaid } from '../../../services/lnbitsHelpers'
import { TIPCARDS_API_ORIGIN } from '../../../constants'
import { Card } from '../Card'

type Amount = z.infer<typeof Card.shape.amount>

/**
 * @throws ZodError
 * @throws ErrorWithCode
 */
export const CardFromCardRedis = CardRedis.transform(async (card) => Card.parse({
  hash: card.cardHash,
  created: mapCreated(card),
  shared: card.lnurlp?.shared,
  landingPageViewed: card.landingPageViewed != null ? new Date(card.landingPageViewed * 1000) : undefined,
  textForWithdraw: card.text,
  noteForStatusPage: card.note,

  lnurl: encodeLnurl(`${TIPCARDS_API_ORIGIN}/api/lnurl/${card.cardHash}`),
  invoice: await mapInvoice(card),
  lnurlp: await mapLnurlp(card),
  amount: mapAmount(card),
  funded: mapFunded(card),
  isBulkWithdraw: false,
  withdrawPending: await mapWithdrawPending(card),
  withdrawn: mapWithdrawn(card),
}))

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
    const cardApi = await checkIfCardInvoiceIsPaid(CardApi.parse(card))
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
  const cardApi = await checkIfCardLnurlpIsPaid(CardApi.parse(card))
  return {
    expired: !!cardApi.lnurlp?.expired,
  }
}

const mapAmount = (card: CardRedis) => {
  const amount: Amount = {
    pending: undefined,
    funded: undefined,
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

const mapWithdrawPending = async (card: CardRedis) => {
  const cardApi = CardApi.parse(card)
  let withdrawPending = false
  if (mapFunded(cardApi) && !mapWithdrawn) {
    await checkIfCardIsUsed(cardApi)
    withdrawPending = !!cardApi.withdrawPending
  }
  return withdrawPending
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
const mapWithdrawn = (card: CardRedis) => card.used != null ? new Date(card.used * 1000) : undefined
