import { lockCardByHash, releaseCardByHash } from '@backend/database/queries'

/** @throws */
export const lockCard = async (cardHash: string): Promise<string> => {
  for (let lockAttempts = 0; lockAttempts < 30; lockAttempts++) {
    const lockValue = await lockCardByHash(cardHash)
    if (lockValue != null) {
      return lockValue
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw Error(`Cannot lock card ${cardHash} after 9 seconds of trying. It is currently locked by another process.`)
}

/** @throws */
export const lockCards = async (cardHashes: string[]) => {
  const lockValues = await Promise.all(cardHashes.map(async (cardHash) => ({
    cardHash,
    lockValue: await lockCard(cardHash),
  })))
  return lockValues
}

/** @throws */
export const releaseCards = async (lockValues: { cardHash: string, lockValue: string }[]) => {
  await Promise.all(lockValues.map(async ({ cardHash, lockValue }) => {
    await releaseCardByHash(cardHash, lockValue)
  }))
}
