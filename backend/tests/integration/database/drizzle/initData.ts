import { randomUUID } from 'crypto'

import { Card } from '@backend/database/drizzle/schema/Card'
import { CardVersion } from '@backend/database/drizzle/schema/CardVersion'
import { getClient } from '@backend/database/drizzle/client'
import hashSha256 from '@backend/services/hashSha256'

export const createAndAddCard = async (): Promise<Card> => {
  const card = {
    hash: hashSha256(randomUUID()),
    created: new Date(),
    set: null,
  }
  const client = await getClient()
  await client.insert(Card)
    .values(card)
  
  return card
}

export const createAndAddCardVersion = async (card: Card): Promise<CardVersion> => {
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
  const client = await getClient()
  await client.insert(CardVersion)
    .values(cardVersion)
  return cardVersion
}
