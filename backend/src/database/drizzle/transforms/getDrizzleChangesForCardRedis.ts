import type { Card as CardRedis } from '@backend/database/redis/data/Card'
import { CardVersion } from '@backend/database/drizzle/schema'
import { getLatestCardVersion } from '@backend/database/drizzle/queries'

import { getInvoiceFromCardRedis } from './drizzleDataFromCardRedis'

/** @throws */
export const getDrizzleChangesForCardRedis = async (cardRedis: CardRedis) => {
  const cardVersion = await getLatestCardVersion(cardRedis.cardHash)
  if (cardVersion == null) {
    throw new Error(`Cannot update card ${cardRedis.cardHash} as it doesn't exist.`)
  }
  return {
    changes: {
      cardVersion: getNewCardVersion(cardVersion, cardRedis),
      ...getInvoiceFromCardRedis(cardRedis, cardVersion),
    },
  }
}

const getNewCardVersion = (cardVersion: CardVersion, cardRedis: CardRedis) => ({
  ...cardVersion,
  textForWithdraw: cardRedis.text,
  noteForStatusPage: cardRedis.note,
  sharedFunding: !!cardRedis.lnurlp?.shared,
  landingPageViewed: dateFromUnixTimestampOrNull(cardRedis.landingPageViewed),
})

const dateFromUnixTimestampOrNull = (timestamp: number | null) => {
  if (timestamp == null) {
    return null
  }
  return dateFromUnixTimestamp(timestamp)
}

const dateFromUnixTimestamp = (timestamp: number) => new Date(timestamp * 1000)
