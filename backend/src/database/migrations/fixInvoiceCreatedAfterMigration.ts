import assert from 'assert'

import '@backend/initEnv' // Info: .env needs to read before imports

import { asTransaction } from '@backend/database/drizzle/client'

// migration specific
import {
  getAllCards as getAllRedisCards,
  getAllSets as getAllRedisSets,
} from '@backend/database/redis/queriesRedisOnly'

/* eslint-disable no-console */
export const fixInvoiceCreatedAfterMigration = async () => {
  await migrateInvoicesFromLnurlp()
  await migrateInvoicesFromSetFunding()
}

const migrateInvoicesFromLnurlp = async () => {
  const cardsRedis = await getAllRedisCards()

  console.log(`\nStarting migration for ${cardsRedis.length} cards.`)

  let skippedCardsCount = 0
  let migratedCardsCount = 0
  let migratedInvoicesCount = 0
  for (const cardRedis of cardsRedis) {
    if (cardRedis.lnurlp == null) {
      skippedCardsCount += 1
      console.log(`No lnurlp for card ${cardRedis.cardHash}, skipping ...`)
      continue
    }

    const created = new Date(cardRedis.lnurlp.created * 1000)
    const expiresAt = new Date(
      cardRedis.lnurlp.created * 1000
        + 1000 * 60 * 5,
    )
    const paid = cardRedis.lnurlp.paid != null
      ? new Date(cardRedis.lnurlp.paid * 1000)
      : null

    console.log(`Migrating card invoices for cardHash ${cardRedis.cardHash} ...`)
    await asTransaction(async (queries) => {
      const latestCardVersion = await queries.getLatestCardVersion(cardRedis.cardHash)
      assert(latestCardVersion != null, `No cardVersion for hash ${cardRedis.cardHash} found!`)

      const invoices = await queries.getAllInvoicesFundingCardVersion(latestCardVersion)
      await Promise.all(invoices.map(async (invoice) => {
        invoice.created = created
        invoice.expiresAt = expiresAt
        invoice.paid = paid
        await queries.updateInvoice(invoice)
        migratedInvoicesCount += 1
      }))

      migratedCardsCount += 1
    })
  }

  console.log(`\n${skippedCardsCount} card(s) skipped.`)
  console.log(`\n${migratedCardsCount} card migration(s) fixed!`)
  console.log(`\n${migratedInvoicesCount} invoice migration(s) fixed!`)
}

const migrateInvoicesFromSetFunding = async () => {
  const setsRedis = await getAllRedisSets()

  console.log(`\nStarting migration for ${setsRedis.length} sets.`)

  let skippedCount = 0
  let migratedCount = 0
  for (const setRedis of setsRedis) {
    if (setRedis.invoice == null) {
      skippedCount += 1
      console.log(`No invoice for set ${setRedis.id}, skipping ...`)
      continue
    }

    const paymentHash = setRedis.invoice.payment_hash
    const created = new Date(setRedis.invoice.created * 1000)
    const expiresAt = new Date(
      setRedis.invoice.created * 1000
        + 1000 * 60 * 5,
    )

    console.log(`Migrating set ${setRedis.id} invoice ...`)
    await asTransaction(async (queries) => {
      const invoice = await queries.getInvoiceByPaymentHash(paymentHash)
      assert(invoice != null, `No invoice for set ${setRedis.id} funding found!`)

      invoice.created = created
      invoice.expiresAt = expiresAt
      await queries.updateInvoice(invoice)

      migratedCount += 1
    })
  }

  console.log(`\n${skippedCount} card(s) skipped.`)
  console.log(`\n${migratedCount} card migration(s) fixed!`)
}
