import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

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
    if (error instanceof ErrorWithCode && error.code == ErrorCode.LockManagerAquireTimeout) {
      throw Error(`Cannot lock card ${cardHash} after 9 seconds of trying. It is currently locked by another process.`)
    }
    throw error
  }
}

/** @throws */
export const lockCards = async (cardHashes: string[]): Promise<Lock[]> =>  {
  const lockManager = getLockManager()

  try {
    return await lockManager.acquireAll({
      resourceIds: cardHashes,
      timeout: 9000,
    })
  } catch (error) {
    if (error instanceof ErrorWithCode && error.code == ErrorCode.LockManagerAquireTimeout) {
      throw Error(`Cannot lock cardHashes ${cardHashes} after 9 seconds of trying. It is currently locked by another process.`)
    }
    throw error
  }
}

export const safeReleaseCard = async (lock: Lock) => {
  try {
    lock.release()
  } catch (error) {
    console.error(`Error releasing card lock for card ${lock.resourceId} with lock (id:${lock.id}, resourceId:${lock.resourceId}`, error)
  }
}

export const safeReleaseCards = async (locks: Lock[]) => {
  try {
    await releaseCards(locks)
  } catch (error) {
    console.error('Error releasing card locks', locks, error)
  }
}

/** @throws */
const releaseCards = async (locks: Lock[]) => {
  await Promise.all(locks.map(async (lock) => {
    await safeReleaseCard(lock)
  }))
}
