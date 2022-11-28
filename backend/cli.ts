/* eslint-disable */
import 'dotenv/config'

import { getAllCardHashes, getCardByHash } from './src/services/database'
import { getCardIsUsedFromLnbits } from './src/services/lnbitsHelpers'

const run = async () => {
  let hashes: string[] = []
  try {
    hashes = await getAllCardHashes()
  } catch (error) {
    console.error(error)
  }

  console.log(`Starting used check for ${hashes.length} cards.\n\n`)

  for (let x = 0; x < hashes.length; x += 1) {
    const card = await getCardByHash(hashes[x])
    if (card == null || card.used == null || card.lnbitsWithdrawId == null) {
      continue
    }
    try {
      const used = await getCardIsUsedFromLnbits(card)
      if (!used) {
        console.log(`\nCard ${card.used} is not used and needs database update.`)
      }
    } catch (error) {
      console.error(`\nUnable to fetch card status for card ${card.used}.`)
    }
  }

  console.log(`\nChecking done.\n`)
  process.exit()
}
run()
/* eslint-enable */
