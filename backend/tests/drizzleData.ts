import { randomUUID } from 'crypto'

import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { CardVersionHasInvoice } from '@backend/database/drizzle/schema/CardVersionHasInvoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'
import hashSha256 from '@backend/services/hashSha256'

export const createCard = (): Card => ({
  hash: hashSha256(randomUUID()),
  created: new Date(),
  set: null,
})

export const createCardVersion = (card: Card): CardVersion => {
  const id = randomUUID()
  return {
    id,
    card: card.hash,
    created: new Date(),
    lnurlP: null,
    lnurlW: null,
    textForWithdraw: `${id} textForWithdraw`,
    noteForStatusPage: `${id} noteForStatusPage`,
    sharedFunding: false,
    landingPageViewed: null,
  }
}

export const createInvoice = (amount: number, ...cardVersions: CardVersion[]): {
  invoice: Invoice,
  cardVersionsHaveInvoice: CardVersionHasInvoice[],
} => {
  const invoice = {
    amount,
    paymentHash: hashSha256(randomUUID()),
    paymentRequest: hashSha256(randomUUID()),
    created: new Date(),
    paid: null,
    expiresAt: new Date(),
    extra: '',
  }
  const cardVersionsHaveInvoice = cardVersions.map((cardVersion) => ({
    cardVersion: cardVersion.id,
    invoice: invoice.paymentHash,
  }))
  return { invoice, cardVersionsHaveInvoice }
}

/** side-effect: updates cardVersion.lnurlP */
export const createLnurlP = (cardVersion: CardVersion): LnurlP => {
  const lnurlp = {
    lnbitsId: hashSha256(randomUUID()),
    created: new Date(),
    expiresAt: new Date(),
    finished: null,
  }
  cardVersion.lnurlP = lnurlp.lnbitsId
  return lnurlp
}

/** side-effect: updates cardVersion.lnurlW */
export const createLnurlW = (...cardVersions: CardVersion[]): LnurlW => {
  const lnurlw = {
    lnbitsId: hashSha256(randomUUID()),
    created: new Date(),
    expiresAt: new Date(),
    withdrawn: null,
  }
  cardVersions.forEach((cardVersion) => {
    cardVersion.lnurlW = lnurlw.lnbitsId
  })
  return lnurlw
}