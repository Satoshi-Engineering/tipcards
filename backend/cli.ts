/* eslint-disable */
import 'dotenv/config'
import readline from 'readline'

import { cardApiFromCardRedis } from '@shared/data/transforms/cardApiFromCardRedis'

import { getAllCardHashes, getCardByHash, updateCard, deleteCard } from '@backend/services/database'
import { getCardIsUsedFromLnbits } from '@backend/services/lnbitsHelpers'

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

  console.log(`\nChecking done.\n`)
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
      card.lnurlp != null &&
      card.lnurlp.shared &&
      card.lnurlp.amount != null &&
      card.lnurlp.amount > 0
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

const readlineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})
const prompt = (question: string) => {
  const promise = new Promise((resolve) => {
    readlineInterface.question(question, (answer) => {
      resolve(answer)
    })
  })
  return promise
}
const run = async () => {
  console.log('What do you want to do?')
  console.log('1. Check all cards with used flag if they are actually used (by calling lnbits).')
  console.log('2. Migrate to a new lnbits instance. This means deleting unfunded cards from the database and clearing the withdrawId from all unclaimed cards.')
  const answer = await prompt('Type a number: ')

  if (answer === '1') {
    await clearUnusedCards()
  } else if (answer === '2') {
    await migrateLnbitsInstance()
  } else {
    console.log('Unknown command.')
  }
  process.exit()
}
run()
/* eslint-enable */
