import '@backend/initEnv' // Info: .env needs to read before imports

import { prompt } from '@backend/services/cliHelpers.js'

// migration specific
import { getAllUsers as getAllRedisUsers } from '@backend/database/redis/queries.js'
import {
  getAllBulkWithdraws as getAllRedisBulkWithdraws,
  getAllCards as getAllRedisCards,
  getAllSets as getAllRedisSets,
} from '@backend/database/redis/queriesRedisOnly.js'
import {
  createBulkWithdraw as createDrizzleBulkWithdraw,
  createCard as createDrizzleCard,
  updateCard as updateDrizzleCard,
  createUser as createDrizzleUser,
  createSet as createDrizzleSet,
} from '@backend/database/drizzle/queriesRedis.js'

/* eslint-disable no-console */
export const migrateRedisToDrizzle = async () => {
  const answer = await prompt('Are you sure you know what you are doing (yes/no)? ')
  if (answer !== 'yes') {
    process.exit(1)
  }

  await migrateUsers()
  await migrateCards()
  await migrateSets()
  await migrateBulkWithdraws()

  console.log('All done! 👍')
}

const migrateUsers = async () => {
  const users = await getAllRedisUsers()

  console.log(`\nStarting migration for ${users.length} users.\n`)

  let migratedCount = 0
  for (const user of users) {
    console.log(`Migrating user ${user.id} ...`)
    await createDrizzleUser(user)
    migratedCount += 1
  }

  console.log(`\n${migratedCount} user(s) migrated!`)
}

const migrateCards = async () => {
  const cards = await getAllRedisCards()

  console.log(`\nStarting migration for ${cards.length} cards.\n`)

  let migratedCount = 0
  for (const card of cards) {
    console.log(`Migrating card ${card.cardHash} ...`)
    await createDrizzleCard(card)
    await updateDrizzleCard(card)
    migratedCount += 1
  }

  console.log(`\n${migratedCount} card(s) migrated!`)
}

const migrateSets = async () => {
  const sets = await getAllRedisSets()

  console.log(`\nStarting migration for ${sets.length} sets.\n`)

  let migratedCount = 0
  for (const set of sets) {
    console.log(`Migrating set ${set.id} ...`)
    await createDrizzleSet(set)
    migratedCount += 1
  }

  console.log(`\n${migratedCount} set(s) migrated!`)
}

const migrateBulkWithdraws = async () => {
  const bulkWithdraws = await getAllRedisBulkWithdraws()

  console.log(`\nStarting migration for ${bulkWithdraws.length} bulk withdraws.\n`)

  let migratedCount = 0
  for (const bulkWithdraw of bulkWithdraws) {
    console.log(`Migrating bulk withdraw ${bulkWithdraw.id} ...`)
    await createDrizzleBulkWithdraw(bulkWithdraw)
    migratedCount += 1
  }

  console.log(`\n${migratedCount} bulk withdraw(s) migrated!`)
}
/* eslint-enable no-console */
