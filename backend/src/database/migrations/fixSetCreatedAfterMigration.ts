import '@backend/initEnv' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client.js'

// migration specific
import {
  getAllSets as getAllRedisSets,
} from '@backend/database/redis/queriesRedisOnly.js'

/* eslint-disable no-console */
export const fixSetCreatedAfterMigration = async () => {
  const startMigration = Math.floor(+ new Date() / 1000)
  const setsRedis = await getAllRedisSets()

  console.log(`\nStarting migration for ${setsRedis.length} sets.`)

  let alreadyMigratedCorrectlyCount = 0
  let skippedCount = 0
  let migratedCount = 0
  let notFoundCount = 0
  for (const setRedis of setsRedis) {
    if (setRedis.created < startMigration) {
      alreadyMigratedCorrectlyCount += 1
      console.log(`Creation date already set for set ${setRedis.id}`)
      continue
    }

    if (setRedis.invoice == null) {
      skippedCount += 1
      console.log(`Skipping set ${setRedis.id} as it has no invoice.`)
      continue
    }
    const createdDate = new Date(setRedis.invoice.created * 1000)

    console.log(`Migrating set ${setRedis.id} ...`)
    await asTransaction(async (queries) => {
      const setDrizzle = await queries.getSetById(setRedis.id)
      if (setDrizzle == null) {
        notFoundCount += 1
        console.log(`Set ${setRedis.id} not found in drizzle ...`)
        return
      }
      setDrizzle.created = createdDate
      await queries.updateSet(setDrizzle)

      migratedCount += 1
    })
  }

  console.log(`\n${alreadyMigratedCorrectlyCount} set(s) already migrated.`)
  console.log(`\n${skippedCount} set(s) skipped.`)
  console.log(`\n${migratedCount} set migration(s) fixed!`)
  console.log(`\n${notFoundCount} set(s) not found in drizzle.`)
}
