import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'

export const CARD_UNFUNDED: Card = {
  hash: 'unitTestCardUnfunded',
  created: new Date(),
  set: null,
}

export const CARD_VERSION_UNFUNDED: CardVersion = {
  id: 'unitTestCardVersionUnfunded',
  card: CARD_UNFUNDED.hash,
  created: new Date(),
  lnurlP: null,
  lnurlW: null,
  textForWithdraw: 'some text',
  noteForStatusPage: 'some note',
  sharedFunding: false,
  landingPageViewed: null,
}
