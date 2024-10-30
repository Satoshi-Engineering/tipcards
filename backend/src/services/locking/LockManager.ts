import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

import Lock from './Lock.js'

type AwaitingAquire = {
  resolve: (lock: Lock) => void
  reject: (error: Error) => void
  timeoutId: NodeJS.Timeout | undefined
}

export default class LockManager {
  async acquire({
    resourceId,
    timeout,
  } : { resourceId: string, timeout?: number }): Promise<Lock> {
    if (!this.lockedResourcesById.has(resourceId)) {
      return this.lock(resourceId)
    }

    return await new Promise((resolve, reject) => {
      const awaitingAquire: AwaitingAquire = {
        resolve,
        reject,
        timeoutId: undefined,
      }
      if (timeout) {
        awaitingAquire.timeoutId = setTimeout(() => {
          this.removeWaitingAquire(resourceId, awaitingAquire)
          reject(new ErrorWithCode(`Timeout while waiting for lock on resource ${resourceId}`, ErrorCode.LockManagerAquireTimeout))
        }, timeout)
      }
      this.addWaitingAquire(resourceId, awaitingAquire)
    })
  }

  async acquireAll({
    resourceIds,
    timeout,
  }: { resourceIds: string[], timeout?: number }): Promise<Lock[]> {
    const locks: Lock[] = []
    await Promise.allSettled(resourceIds.map(async (resourceId) => {
      const lock = await this.acquire({ resourceId, timeout })
      locks.push(lock)
    }))

    if (locks.length !== resourceIds.length) {
      locks.forEach((lock) => lock.release())
      throw new ErrorWithCode(`Timeout while waiting for multiple resources ${resourceIds}`, ErrorCode.LockManagerAquireTimeout)
    }

    return locks
  }

  release(lock: Lock) {
    if (!this.lockedResourcesById.has(lock.resourceId)) {
      throw new ErrorWithCode(`Release: Lock (${lock.id}) tries to unlock ${lock.resourceId}, but it is not locked`, ErrorCode.LockManagerResourceNotLocked)
    }
    if (this.lockedResourcesById.get(lock.resourceId) !== lock.id) {
      throw new ErrorWithCode(
        `Release: Lock (${lock.id}) tries to unlock ${lock.resourceId}, but it was locked by a different lock: ${this.lockedResourcesById.get(lock.resourceId)}`,
        ErrorCode.LockManagerResourceLockedWithDifferentLock,
      )
    }

    this.lockedResourcesById.delete(lock.resourceId)

    this.resolveNextAwaitingAquire(lock.resourceId)
  }

  private lockedResourcesById: Map<string, string> = new Map()
  private awaitingAquiresByResourceId: Map<string, AwaitingAquire[]> = new Map()

  private lock(resourceId: string) {
    const lock = new Lock(this, resourceId)

    if (this.lockedResourcesById.has(resourceId)) {
      throw new Error(`Ressource ${resourceId} already locked`)
    }

    this.lockedResourcesById.set(resourceId, lock.id)
    return lock
  }

  private addWaitingAquire(resourceId: string, awaitingAquire: AwaitingAquire) {
    let awaitingAquiresForResource = this.awaitingAquiresByResourceId.get(resourceId)
    if (!awaitingAquiresForResource) {
      awaitingAquiresForResource = []
      this.awaitingAquiresByResourceId.set(resourceId, awaitingAquiresForResource)
    }
    awaitingAquiresForResource.push(awaitingAquire)
  }

  private resolveNextAwaitingAquire(resourceId: string) {
    const awaitingAquire = this.getNextAwaitingAquire(resourceId)
    if (awaitingAquire == null) {
      return
    }

    const lock = this.lock(resourceId)
    awaitingAquire.resolve(lock)
  }

  private removeWaitingAquire(resourceId: string, awaitingAquire: AwaitingAquire) {
    const awaitingAquiresForResource = this.awaitingAquiresByResourceId.get(resourceId)
    if (!awaitingAquiresForResource) {
      return
    }

    awaitingAquiresForResource.splice(awaitingAquiresForResource.indexOf(awaitingAquire), 1)
  }

  private getNextAwaitingAquire(resourceId: string) {
    const awaitingAquiresForResource = this.awaitingAquiresByResourceId.get(resourceId)

    if (!awaitingAquiresForResource) {
      return undefined
    }

    if (awaitingAquiresForResource.length >= 1) {
      const awaitingAquire = awaitingAquiresForResource[0]
      this.removeWaitingAquire(resourceId, awaitingAquire)
      this.stopTimeout(awaitingAquire)
      return awaitingAquire
    } else {
      this.awaitingAquiresByResourceId.delete(resourceId)
      return undefined
    }
  }

  private stopTimeout(awaitingAquire?: AwaitingAquire) {
    if (awaitingAquire && awaitingAquire.timeoutId) {
      clearTimeout(awaitingAquire.timeoutId)
    }
  }
}
