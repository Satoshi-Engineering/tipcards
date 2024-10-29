import Lock from './locking/Lock.js'
import LockManager from './locking/LockManager.js'

let lockManager: LockManager | null = null

const getLockManager = () => {
  if (lockManager == null) {
    lockManager = new LockManager()
  }
  return lockManager
}

/** @throws */
export const lockCard = async (cardHash: string): Promise<Lock> => {
  const lockManager = getLockManager()

  try {
    return await lockManager.acquire({
      resourceId: cardHash,
      timeout: 9000,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Timeout while waiting')) {
      throw Error(`Cannot lock card ${cardHash} after 9 seconds of trying. It is currently locked by another process.`)
    }
    throw error
  }
}

/** @throws */
export const lockCards = async (cardHashes: string[]) => {
  const locks = await Promise.all(cardHashes.map(async (cardHash) => ({
    cardHash,
    lock: await lockCard(cardHash),
  })))
  return locks
}

export const safeReleaseCard = async (cardHash: string, lock: Lock) => {
  try {
    lock.release()
  } catch (error) {
    console.error(`Error releasing card lock for card ${cardHash} with lock (id:${lock.id}, resourceId:${lock.resourceId}`, error)
  }
}

export const safeReleaseCards = async (locks: { cardHash: string, lock: Lock }[]) => {
  try {
    await releaseCards(locks)
  } catch (error) {
    console.error('Error releasing card locks', locks, error)
  }
}

/** @throws */
const releaseCards = async (locks: { cardHash: string, lock: Lock }[]) => {
  await Promise.all(locks.map(async ({ cardHash, lock }) => {
    await safeReleaseCard(cardHash, lock)
  }))
}
