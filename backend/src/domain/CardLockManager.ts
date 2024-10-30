import Lock from '@backend/services/locking/Lock.js'
import LockManager from '@backend/services/locking/LockManager.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

export default class CardLockManager {
  public static init({ aquireTimeout }: { aquireTimeout: number }): void {
    if (CardLockManager.singleton != null) {
      throw new Error('CardLockManager already initialized!')
    }

    CardLockManager.singleton = new CardLockManager({ aquireTimeout })
  }

  public static get instance(): CardLockManager {
    if (CardLockManager.singleton == null) {
      throw new Error('CardLockManager instance accessed before init!')
    }

    return CardLockManager.singleton
  }

  async lockCard(cardHash: string): Promise<Lock> {
    try {
      return await this.lockManager.acquire({
        resourceId: cardHash,
        timeout: this.aquireTimeout,
      })
    } catch (error) {
      if (error instanceof ErrorWithCode && error.code == ErrorCode.LockManagerAquireTimeout) {
        throw Error(`Cannot lock card "${cardHash}" after ${this.aquireTimeout / 1000 } seconds of trying. It is currently locked by another process.`)
      }
      throw error
    }
  }

  async lockCards(cardHashes: string[]): Promise<Lock[]> {
    try {
      return await this.lockManager.acquireAll({
        resourceIds: cardHashes,
        timeout: this.aquireTimeout,
      })
    } catch (error) {
      if (error instanceof ErrorWithCode && error.code == ErrorCode.LockManagerAquireTimeout) {
        throw Error(`Cannot lock cardHashes "${cardHashes.join('", "')}" after ${this.aquireTimeout / 1000 } seconds of trying. It is currently locked by another process.`)
      }
      throw error
    }
  }

  private static singleton: CardLockManager

  private lockManager = new LockManager()
  private aquireTimeout: number

  private constructor({ aquireTimeout }: { aquireTimeout: number }) {
    this.aquireTimeout = aquireTimeout
  }
}
