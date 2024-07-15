import assert from 'assert'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client.js'

// migration specific
import {
  getAllCards as getAllRedisCards,
} from '@backend/database/redis/queriesRedisOnly.js'

/* eslint-disable no-console */
export const fixRedisToDrizzleMigrationSetFundingBug = async () => {
  const cards = await getAllRedisCards()

  console.log(`\nStarting migration for ${cards.length} cards.`)

  let skippedCount = 0
  let migratedCorrectlyCount = 0
  let migratedCount = 0
  let doubleSpentCards = 0
  let doubleSpentAmount = 0
  for (const card of cards) {
    if (
      card.lnbitsWithdrawId == null
      || card.used == null
      || card.isLockedByBulkWithdraw
      || card.setFunding == null
    ) {
      skippedCount += 1
      console.log(`Skipping not-used or bulk-withdrawn card ${card.cardHash} ...`)
      continue
    }

    console.log(`Migrating card ${card.cardHash} ...`)
    await asTransaction(async (queries) => {
      const cardVersion = await queries.getLatestCardVersion(card.cardHash)
      assert(cardVersion != null, `No card version for card ${card.cardHash} found!`)

      if (cardVersion.lnurlW === card.lnbitsWithdrawId) {
        migratedCorrectlyCount += 1
        console.log(`Card ${card.cardHash} already migrated correctly.`)
        return
      }

      if (cardVersion.lnurlW != null) {
        const lnurlw = await queries.getLnurlWById(cardVersion.lnurlW)
        if (lnurlw.withdrawn != null) {
          doubleSpentCards += 1
          doubleSpentAmount += card.setFunding?.amount || 0
        }
      }

      cardVersion.lnurlW = card.lnbitsWithdrawId
      await queries.updateCardVersion(cardVersion)
      migratedCount += 1
    })
  }

  console.log(`\n${skippedCount} card(s) skipped.`)
  console.log(`\n${migratedCorrectlyCount} card(s) migrated correctly.`)
  console.log(`\n${migratedCount} card migration(s) fixed!`)
  console.log(`\nCards used again: ${doubleSpentCards}`)
  console.log(`\nSats lost due to bug: ${doubleSpentAmount}`)
}
