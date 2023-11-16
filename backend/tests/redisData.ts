import { randomUUID } from 'crypto'

import { Card } from '@backend/database/redis/data/Card'
import hashSha256 from '@backend/services/hashSha256'

export const createCard = (): Card => {
  const cardHash = hashSha256(randomUUID())
  const card = {
    cardHash,
    text: `${cardHash} text`,
    note: `${cardHash} note`,
    invoice: null,
    lnurlp: null,
    setFunding: null,
    lnbitsWithdrawId: null,
    landingPageViewed: null,
    isLockedByBulkWithdraw: false,
    used: null,
  }
  return card
}

export const createInvoice = (amount: number): Card['invoice'] => ({
  amount,
  payment_hash: hashSha256(randomUUID()),
  payment_request: hashSha256(randomUUID()),
  created: Math.round(+ new Date() / 1000),
  paid: null,
})
