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
  for (const cardRedis of cardsRedis) {
    let created: Date | null = null
    if (cardRedis.invoice != null) {
      created = new Date(cardRedis.invoice.created * 1000)
    } else if (cardRedis.lnurlp != null) {
      created = new Date(cardRedis.lnurlp.created)
    } else if (cardRedis.setFunding != null) {
      created = new Date(cardRedis.setFunding.created)
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
      assert(cardDrizzle != null, `No card for hash ${cardRedis.cardHash} found!`)
      cardDrizzle.created = createdDate
      await queries.updateCard(cardDrizzle)

      const cardVersion = await queries.getLatestCardVersion(cardRedis.cardHash)
      assert(cardVersion != null, `No card version for hash ${cardRedis.cardHash} found!`)
      cardVersion.created = createdDate
      await queries.updateCardVersion(cardVersion)

      migratedCount += 1
    })
  }

  console.log(`\n${skippedCount} card(s) skipped.`)
  console.log(`\n${migratedCount} card(s) migrations fixed!`)
}
