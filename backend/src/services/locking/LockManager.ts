import Lock from './Lock.js'

type WaitingAquire = {
  resolve: (lock: Lock) => void
  reject: (error: Error) => void
  timeoutId: NodeJS.Timeout | undefined
}

export default class LockManager {
  private lockedResources: Map<string, boolean> = new Map()
  private waitingAquiresForResource: Map<string, WaitingAquire[]> = new Map()

  async acquire({
    resourceId,
    timeout,
  } : { resourceId: string, timeout?: number }): Promise<Lock> {

    if (!this.lockedResources.has(resourceId)) {
      return this.lock(resourceId)
    }

    return await new Promise((resolve, reject) => {
      const waitingAquire: WaitingAquire = {
        resolve,
        reject,
        timeoutId: undefined,
      }
      if (timeout) {
        waitingAquire.timeoutId = setTimeout(() => {
          this.removeWaitingAquire(resourceId, waitingAquire)
          reject(new Error(`Timeout while waiting for lock on resource ${resourceId}`))
        }, timeout)
      }
      this.addWaitingAquire(resourceId, waitingAquire)
    })
  }

  release(lock: Lock) {
    if (!this.lockedResources.has(lock.resourceId)) {
      throw new Error(`Release: Lock (${lock.id}) tries to unlock ${lock.resourceId}, but it is not locked`)
    }

    this.lockedResources.delete(lock.resourceId)
    const waitingAquire = this.getNextWaitingAquire(lock.resourceId)
    if (waitingAquire) {
      const lockId = this.lock(lock.resourceId)
      waitingAquire.resolve(lockId)
    }
  }

  private lock(resourceId: string) {
    const lock = new Lock(this, resourceId)

    if (this.lockedResources.has(resourceId)) {
      throw new Error(`Ressource ${resourceId} already locked`)
    }

    this.lockedResources.set(resourceId, true)
    return lock
  }

  private addWaitingAquire(resourceId: string, waitingAquire: WaitingAquire) {
    let waitingAquiresForResource = this.waitingAquiresForResource.get(resourceId)
    if (!waitingAquiresForResource) {
      waitingAquiresForResource = []
      this.waitingAquiresForResource.set(resourceId, waitingAquiresForResource)
    }
    waitingAquiresForResource.push(waitingAquire)
  }

  private removeWaitingAquire(resourceId: string, waitingAquire: WaitingAquire) {
    const waitingAquiresForResource = this.waitingAquiresForResource.get(resourceId)
    if (!waitingAquiresForResource) {
      return
    }

    waitingAquiresForResource.splice(waitingAquiresForResource.indexOf(waitingAquire), 1)
    this.stopTimeout(waitingAquire)
  }

  private getNextWaitingAquire(resourceId: string) {
    const waitingAquiresForResource = this.waitingAquiresForResource.get(resourceId)

    if (!waitingAquiresForResource) {
      return undefined
    }

    if (waitingAquiresForResource.length >= 1) {
      const waitingAquire = waitingAquiresForResource.shift()
      this.stopTimeout(waitingAquire)
      return waitingAquire
    } else {
      this.waitingAquiresForResource.delete(resourceId)
      return undefined
    }
  }

  private stopTimeout(waitingAquire?: WaitingAquire) {
    if (waitingAquire && waitingAquire.timeoutId) {
      clearTimeout(waitingAquire.timeoutId)
    }
  }
}
