import assert from 'assert'

import '@backend/initEnv' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client'

// migration specific
import {
  getAllCards as getAllRedisCards,
} from '@backend/database/redis/queriesRedisOnly'

/* eslint-disable no-console */
export const fixCardCreatedAfterMigration = async () => {
  const cardsRedis = await getAllRedisCards()

  console.log(`\nStarting migration for ${cardsRedis.length} cards.`)

  let skippedCount = 0
  let migratedCount = 0
  let cardsNotFoundCount = 0
  for (const cardRedis of cardsRedis) {
    let created: Date | null = null
    if (cardRedis.invoice != null) {
      created = new Date(cardRedis.invoice.created * 1000)
    } else if (cardRedis.lnurlp != null) {
      created = new Date(cardRedis.lnurlp.created * 1000)
    } else if (cardRedis.setFunding != null) {
      created = new Date(cardRedis.setFunding.created * 1000)
    }

    if (created == null) {
      skippedCount += 1
      console.log(`No creation date found for card ${cardRedis.cardHash}`)
      continue
    }
    const createdDate: Date = created

    console.log(`Migrating card ${cardRedis.cardHash} ...`)
    await asTransaction(async (queries) => {
      const cardDrizzle = await queries.getCardByHash(cardRedis.cardHash)
      if (cardDrizzle == null) {
        console.log(`Card ${cardRedis.cardHash} not found in drizzle ...`)
        cardsNotFoundCount += 1
        return
      }
      cardDrizzle.created = createdDate
      await queries.updateCard(cardDrizzle)

      const cardVersion = await queries.getLatestCardVersion(cardRedis.cardHash)
      if (cardVersion == null) {
        console.log(`No cardVersion for ${cardRedis.cardHash} found in drizzle ...`)
        cardsNotFoundCount += 1
        return
      }
      cardVersion.created = createdDate
      await queries.updateCardVersion(cardVersion)

      migratedCount += 1
    })
  }

  console.log(`\n${skippedCount} card(s) skipped.`)
  console.log(`\n${migratedCount} card migration(s) fixed!`)
  console.log(`\n${cardsNotFoundCount} card(s) not found!`)
}
