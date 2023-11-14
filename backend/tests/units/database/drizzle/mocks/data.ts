import { randomUUID } from 'crypto'

import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { Invoice } from '@backend/database/drizzle/schema/Invoice'
import { LnurlP } from '@backend/database/drizzle/schema/LnurlP'
import { LnurlW } from '@backend/database/drizzle/schema/LnurlW'
import hashSha256 from '@backend/services/hashSha256'

import { addCards, addCardVersions, addInvoices, addCardVersionInvoices, addLnurlWs, addLnurlPs } from './queries'

export const createAndAddCard = (): Card => {
  const card = {
    hash: hashSha256(randomUUID()),
    created: new Date(),
    set: null,
  }
  addCards(card)
  return card
}

export const createAndAddCardVersion = (card: Card): CardVersion => {
  const id = randomUUID()
  const cardVersion = {
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
  addCardVersions(cardVersion)
  return cardVersion
}

export const createAndAddInvoice = (amount: number, ...cardVersions: CardVersion[]): Invoice => {
  const invoice = {
    amount,
    paymentHash: hashSha256(randomUUID()),
    paymentRequest: hashSha256(randomUUID()),
    created: new Date(),
    paid: null,
    expiresAt: new Date(),
    extra: '',
  }
  addInvoices(invoice)
  cardVersions.forEach((cardVersion) => {
    addCardVersionInvoices({
      cardVersion: cardVersion.id,
      invoice: invoice.paymentHash,
    })
  })
  return invoice
}

export const createAndAddLnurlP = (cardVersion: CardVersion): LnurlP => {
  const lnbitsId = hashSha256(randomUUID())
  const lnurlp = {
    lnbitsId,
    created: new Date(),
    expiresAt: new Date(),
    finished: null,
  }
  addLnurlPs(lnurlp)
  cardVersion.lnurlP = lnbitsId
  return lnurlp
}

export const createAndAddLnurlW = (...cardVersions: CardVersion[]): LnurlW => {
  const lnbitsId = hashSha256(randomUUID())
  const lnurlw = {
    lnbitsId,
    created: new Date(),
    expiresAt: new Date(),
    withdrawn: null,
  }
  addLnurlWs(lnurlw)
  cardVersions.forEach((cardVersion) => {
    cardVersion.lnurlW = lnbitsId
  })
  return lnurlw
}
