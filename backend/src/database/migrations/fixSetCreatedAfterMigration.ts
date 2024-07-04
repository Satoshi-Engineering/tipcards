import assert from 'assert'

import '@backend/initEnv' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client'

// migration specific
import {
  getAllSets as getAllRedisSets,
} from '@backend/database/redis/queriesRedisOnly'

/* eslint-disable no-console */
export const fixSetCreatedAfterMigration = async () => {
  const setsRedis = await getAllRedisSets()

  console.log(`\nStarting migration for ${setsRedis.length} sets.`)

  let alreadyMigratedCorrectlyCount = 0
  let skippedCount = 0
  let migratedCount = 0
  for (const setRedis of setsRedis) {
    if (setRedis.created != null) {
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
      assert(setDrizzle != null, `No set for id ${setRedis.id} found!`)
      setDrizzle.created = createdDate
      await queries.updateSet(setDrizzle)

      migratedCount += 1
    })
  }

  console.log(`\n${alreadyMigratedCorrectlyCount} set(s) already migrated.`)
  console.log(`\n${skippedCount} set(s) skipped.`)
  console.log(`\n${migratedCount} set migration(s) fixed!`)
}
