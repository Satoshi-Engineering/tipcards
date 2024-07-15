import assert from 'assert'

import '@backend/initEnv.js' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client.js'

// migration specific
import {
  getAllCards as getAllRedisCards,
} from '@backend/database/redis/queriesRedisOnly.js'

/* eslint-disable no-console */
export const fixLnurlWsCreatedAfterMigration = async () => {
  const cardsRedis = await getAllRedisCards()

  console.log(`\nStarting migration for ${cardsRedis.length} cards.`)

  let skippedCardsCount = 0
  let migratedCardsCount = 0
  for (const cardRedis of cardsRedis) {
    if (cardRedis.lnbitsWithdrawId == null) {
      skippedCardsCount += 1
      console.log(`No lnbitsWithdrawId for card ${cardRedis.cardHash}, skipping ...`)
      continue
    }
    const lnurlwId = cardRedis.lnbitsWithdrawId

    let paid: Date | null = null
    if (cardRedis.invoice?.paid != null) {
      paid = new Date(cardRedis.invoice.paid * 1000)
    } else if (cardRedis.lnurlp?.paid != null) {
      paid = new Date(cardRedis.lnurlp.paid * 1000)
    } else if (cardRedis.setFunding?.paid != null) {
      paid = new Date(cardRedis.setFunding.paid * 1000)
    }
    assert(paid != null, `No funding for card ${cardRedis.cardHash} found!`)
    const created: Date = paid

    console.log(`Migrating card lnurlWs for cardHash ${cardRedis.cardHash} ...`)
    await asTransaction(async (queries) => {
      const lnurlw = await queries.getLnurlWById(lnurlwId)
      assert(lnurlw != null, `No funding for card ${cardRedis.cardHash} found!`)

      lnurlw.created = created
      await queries.updateLnurlW(lnurlw)
      migratedCardsCount += 1
    })
  }

  console.log(`\n${skippedCardsCount} card(s) skipped.`)
  console.log(`\n${migratedCardsCount} card lnurlW migration(s) fixed!`)
}
