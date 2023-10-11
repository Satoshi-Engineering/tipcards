import type z from 'zod'

import { Card as CardDatabase } from '../../../../../src/data/Card'
import { encodeLnurl } from '../../../../../src/modules/lnurlHelpers'

import { checkIfCardIsUsed } from '../../../services/lnbitsHelpers'
import { TIPCARDS_API_ORIGIN } from '../../../constants'
import { Card } from '../Card'

type Invoice = z.infer<typeof Card.shape.invoice>
type Lnurlp = z.infer<typeof Card.shape.lnurlp>
type Amount = z.infer<typeof Card.shape.amount>

/**
 * @throws ZodError
 * @throws ErrorWithCode
 */
export const CardFromCardDatabase = CardDatabase.transform(async (card) => Card.parse({
  hash: card.cardHash,
  created: mapCreated(card),
  shared: card.lnurlp?.shared,
  landingPageViewed: card.landingPageViewed != null ? new Date(card.landingPageViewed * 1000) : undefined,
  textForWithdraw: card.text,
  noteForStatusPage: card.note,

  lnurl: encodeLnurl(`${TIPCARDS_API_ORIGIN}/api/lnurl/${card.cardHash}`),
  invoice: mapInvoice(card),
  lnurlp: mapLnurlp(card),
  amount: mapAmount(card),
  funded: mapFunded(card),
  isBulkWithdraw: false,
  withdrawPending: await mapWithdrawPending(card),
  withdrawn: mapWithdrawn(card),
}))

const mapCreated = (card: CardDatabase) => {
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

const mapInvoice = (card: CardDatabase) => {
  let invoice: Invoice = undefined
  if (card.invoice != null) {
    invoice = {
      isSet: false,
      expired: card.invoice.expired != null ? new Date() : undefined,
    }
  } else if (card.setFunding != null) {
    invoice = {
      isSet: true,
      expired: card.setFunding.expired != null ? new Date() : undefined,
    }
  }
  return invoice
}

const mapLnurlp = (card: CardDatabase) => {
  let lnurlp: Lnurlp = undefined
  if (card.lnurlp != null) {
    lnurlp = {
      expired: card.lnurlp.expired != null ? new Date() : undefined,
    }
  }
  return lnurlp
}

const mapAmount = (card: CardDatabase) => {
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

const mapWithdrawPending = async (card: CardDatabase) => {
  let withdrawPending = false
  if (mapFunded(card) && !mapWithdrawn) {
    await checkIfCardIsUsed(card)
    withdrawPending = !!card.withdrawPending
  }
  return withdrawPending
}

const mapFunded = (card: CardDatabase) => {
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
const mapWithdrawn = (card: CardDatabase) => card.used != null ? new Date(card.used * 1000) : undefined
