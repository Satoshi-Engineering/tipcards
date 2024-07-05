import '@backend/initEnv' // Info: .env needs to read before imports

import Database from '@backend/database/drizzle/Database'
import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { getCardByHash, updateCard, deleteCard } from '@backend/database/redis/queries'
import { getAllCardHashes } from '@backend/database/redis/queriesRedisOnly'
import { getCardIsUsedFromLnbits } from '@backend/services/lnbitsHelpers'
import { prompt } from '@backend/services/cliHelpers'

// migration specific
import { getAllUsers as getAllRedisUsers } from '@backend/database/redis/queries'
import { migrateRedisToDrizzle } from '@backend/database/migrations/migrateRedisToDrizzle'
import { fixRedisToDrizzleMigrationSetFundingBug } from '@backend/database/migrations/fixRedisToDrizzleMigrationSetFundingBug'
import { fixCardCreatedAfterMigration } from '@backend/database/migrations/fixCardCreatedAfterMigration'
import { fixSetCreatedAfterMigration } from '@backend/database/migrations/fixSetCreatedAfterMigration'
import { fixInvoiceCreatedAfterMigration } from '@backend/database/migrations/fixInvoiceCreatedAfterMigration'
import { fixLnurlWsCreatedAfterMigration } from '@backend/database/migrations/fixLnurlWsCreatedAfterMigration'

/* eslint-disable no-console */
const clearUnusedCards = async () => {
  let hashes: string[] = []
  try {
    hashes = await getAllCardHashes()
  } catch (error) {
    console.error(error)
  }

  console.log(`\nStarting used check for ${hashes.length} cards.\n`)

  for (let x = 0; x < hashes.length; x += 1) {
    const card = await getCardByHash(hashes[x])
    if (card == null || card.used == null || card.lnbitsWithdrawId == null) {
      continue
    }
    try {
      const used = await getCardIsUsedFromLnbits(cardApiFromCardRedis(card))
      if (!used) {
        console.log(`\nCard ${card.cardHash} is not used and needs database update.`)
      }
    } catch (error) {
      console.error(`\nUnable to fetch card status for card ${card.cardHash}.`)
    }
  }

  console.log('\nChecking done.\n')
}

const migrateLnbitsInstance = async () => {
  const answer = await prompt('Are you sure you know what you are doing (yes/no)? ')
  if (answer !== 'yes') {
    process.exit(1)
  }

  let hashes: string[] = []
  try {
    hashes = await getAllCardHashes()
  } catch (error) {
    console.error(error)
  }

  console.log(`\nStarting check for ${hashes.length} cards.\n`)
  let usedCardsCount = 0
  let unclaimedCardsCount = 0
  let unfundedCardsCount = 0

  for (let x = 0; x < hashes.length; x += 1) {
    const card = await getCardByHash(hashes[x])
    if (card == null) {
      continue
    }

    if (card.used) {
      usedCardsCount += 1
      continue
    }

    if (card.lnbitsWithdrawId != null) {
      card.lnbitsWithdrawId = null
      await updateCard(card)
      unclaimedCardsCount += 1
      continue
    }

    if (
      card.lnurlp != null
      && card.lnurlp.shared
      && card.lnurlp.amount != null
      && card.lnurlp.amount > 0
    ) {
      card.lnurlp.paid = Math.round(+ new Date() / 1000)
      await updateCard(card)
    }

    if (card.lnurlp?.paid != null || card.invoice?.paid != null) {
      unclaimedCardsCount += 1
      continue
    }

    await deleteCard(card)
    unfundedCardsCount += 1
  }

  console.log('\nChecking done:')
  console.log(`  ${usedCardsCount} used cards have been ignored.`)
  console.log(`  ${unclaimedCardsCount} unclaimed cards had their withdrawId removed.`)
  console.log(`  ${unfundedCardsCount} unfunded cards have been deleted.`)
}

const parseAllCards = async () => {
  const cardHashes: string[] = await getAllCardHashes()

  console.log(`\nStarting zod check for ${cardHashes.length} cards.\n`)

  let invalidCount = 0
  for (const cardHash of cardHashes) {
    try {
      await getCardByHash(cardHash)
    } catch (error) {
      invalidCount += 1
      console.log(`Card ${cardHash} not valid.`)
    }
  }

  if (invalidCount > 0) {
    console.log(`\n${invalidCount} invalid card(s) found!`)
  }

  console.log('\nChecking done.\n')
}

const parseSingleCard = async () => {
  const cardHash = await prompt('CardHash: ')
  try {
    await getCardByHash(cardHash)
  } catch (error) {
    console.log(error)
    return
  }
  console.log('Card is valid!')
}

const findUsersWithAvailableImagesAndLandingpages = async () => {
  const users = await getAllRedisUsers()

  console.log(`\nStarting check for ${users.length} users.\n`)

  users.forEach((user) => {
    if (user.availableCardsLogos == null && user.availableLandingPages == null) {
      return
    }
    console.log(`\n-- User ${user.id} has available card logos and/or landingPages.`)
    if (user.availableCardsLogos != null) {
      user.availableCardsLogos.forEach((cardLogo) => {
        console.log(`INSERT INTO UserCanUseImage (user, image, canEdit) VALUES ('${user.id}', '${cardLogo}', false);`)
      })
    }
    if (user.availableLandingPages != null) {
      user.availableLandingPages.forEach((landingPage) => {
        console.log(`INSERT INTO UserCanUseLandingPage (user, landingPage, canEdit) VALUES ('${user.id}', '${landingPage}', false);`)
      })
    }
  })

  console.log('\nChecking done.\n')
}


const run = async () => {
  console.log('Connecting to sql database ...')
  await Database.init()
  loop()
}

const loop = async () => {
  console.log('\nWhat do you want to do?')
  console.log('0. Leave.')
  console.log('1. Check all cards with used flag if they are actually used (by calling lnbits).')
  console.log('2. Migrate to a new lnbits instance. This means deleting unfunded cards from the database and clearing the withdrawId from all unclaimed cards.')
  console.log('3. Parse all cards in redis database with zod.')
  console.log('4. Parse a single card in redis database with zod and print parsing error.')
  console.log('5. Migrate data from redis to drizzle.')
  console.log('6. Find and list users that have available Images and/or Landingpages.')
  console.log('7. Fix redis->drizzle migration bug (used cards that were set funded lost the lnurlW)')
  console.log('8. Fix created dates for all cards after redis->drizzle migration.')
  console.log('9. Fix created dates for all set after redis->drizzle migration.')
  console.log('10. Fix created dates for all invoices after redis->drizzle migration.')
  console.log('11. Fix created dates for all lnurlWs after redis->drizzle migration.')
  const answer = await prompt('Type a number: ')

  if (answer === '0') {
    console.log('Closing database connection ...')
    await Database.closeConnectionIfExists()
    process.exit()
  } if (answer === '1') {
    await clearUnusedCards()
  } else if (answer === '2') {
    await migrateLnbitsInstance()
  } else if (answer === '3') {
    await parseAllCards()
  } else if (answer === '4') {
    await parseSingleCard()
  } else if (answer === '5') {
    await migrateRedisToDrizzle()
  } else if (answer === '6') {
    await findUsersWithAvailableImagesAndLandingpages()
  } else if (answer === '7') {
    await fixRedisToDrizzleMigrationSetFundingBug()
  } else if (answer === '8') {
    await fixCardCreatedAfterMigration()
  } else if (answer === '9') {
    await fixSetCreatedAfterMigration()
  } else if (answer === '10') {
    await fixInvoiceCreatedAfterMigration()
  } else if (answer === '11') {
    await fixLnurlWsCreatedAfterMigration()
  } else {
    console.log('Unknown command.')
  }
  setTimeout(run, 0)
}

run()
/* eslint-enable no-console */
