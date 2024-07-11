import { lockCardByHash, releaseCardByHash } from '@backend/database/queries.js'

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

export const safeReleaseCard = async (cardHash: string, lockValue: string) => {
  try {
    await releaseCardByHash(cardHash, lockValue)
  } catch (error) {
    console.error(`Error releasing card lock for card ${cardHash} with lockValue: ${lockValue}`, error)
  }
}

export const safeReleaseCards = async (lockValues: { cardHash: string, lockValue: string }[]) => {
  try {
    await releaseCards(lockValues)
  } catch (error) {
    console.error('Error releasing card locks', lockValues, error)
  }
}
