import { describe, it, expect, beforeEach } from 'vitest'

import LockManager from '@backend/services/locking/LockManager.js'
import Lock from '@backend/services/locking/Lock.js'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors.js'

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe('LockManager', () => {
  let lockManager: LockManager
  const resourceId = 'resourceId'

  beforeEach(() => {
    lockManager = new LockManager()
  })

  it('should aquire a lock for a resource and release lock', async () => {
    const lock = await lockManager.acquire({ resourceId })
    expect(lock).toBeInstanceOf(Lock)
    lock.release()

    const secondAquire = await lockManager.acquire({ resourceId })
    expect(secondAquire).toBeInstanceOf(Lock)
  })

  it('should fail, because aquire timed out', async () => {
    const lock = await lockManager.acquire({ resourceId })
    expect(lock).toBeInstanceOf(Lock)
    await expect(async () => {
      await lockManager.acquire({
        resourceId,
        timeout: 1,
      })
    }).rejects.toThrowError(new ErrorWithCode('', ErrorCode.LockManagerAquireTimeout))
  })

  it('should fail, because a resource can only be unlocked once', async () => {
    const lock = await lockManager.acquire({ resourceId })
    expect(lock).toBeInstanceOf(Lock)
    lock.release()

    expect(() => {
      lock.release()
    }).toThrowError(new ErrorWithCode('', ErrorCode.LockManagerResourceNotLocked))
  })

  it('should fail, because a resource can only be unlocked with the same lock', async () => {
    const lock = await lockManager.acquire({ resourceId })
    expect(lock).toBeInstanceOf(Lock)

    const culpritLock = new Lock(lockManager, resourceId)

    expect(() => {
      culpritLock.release()
    }).toThrowError(new ErrorWithCode('', ErrorCode.LockManagerResourceLockedWithDifferentLock))
  })

  it('should wait for the release of a lock', async () => {
    const lock = await lockManager.acquire({ resourceId })

    setTimeout(() => {
      lock.release()
    }, 10)

    const secondAquire = await lockManager.acquire({ resourceId })
    expect(secondAquire).toBeInstanceOf(Lock)
  })

  it('should 10x waiting processes should resolve one by another', async () => {
    const MULTIPLE_ACCESSES = 10

    async function accessResource() {
      const lock = await lockManager.acquire({ resourceId })
      await wait(10)
      lock.release()
    }

    let accessFinihed = 0
    await Promise.all(
      Array.from({ length: MULTIPLE_ACCESSES }, () =>
        accessResource().then(() => {
          accessFinihed++
        }),
      ),
    )

    const lastAquire = await lockManager.acquire({ resourceId })
    expect(accessFinihed).toBe(MULTIPLE_ACCESSES)
    expect(lastAquire).toBeInstanceOf(Lock)
    lastAquire.release()
  })

  it('should 10x waiting processes should resolve one by another', async () => {
    const MULTIPLE_ACCESSES = 10

    async function accessResource() {
      const lock = await lockManager.acquire({ resourceId })
      await wait(10)
      lock.release()
    }

    let accessFinihed = 0
    for (let i = 0; i < MULTIPLE_ACCESSES; i++) {
      accessResource().then(() => {
        accessFinihed++
      })
    }

    const lastAquire = await lockManager.acquire({ resourceId })
    expect(accessFinihed).toBe(MULTIPLE_ACCESSES)
    expect(lastAquire).toBeInstanceOf(Lock)
    lastAquire.release()
  })

  it('should aquire locks for 10 resources', async () => {
    const NUMBER_OF_RESOURCES = 10
    const resourceIds = Array(NUMBER_OF_RESOURCES).fill(0).map((_, i) => `resourceId${i}`)

    const locks = await lockManager.acquireAll({ resourceIds })

    expect(locks.length).toBe(NUMBER_OF_RESOURCES)
    locks.forEach(lock => {
      expect(lock).toBeInstanceOf(Lock)
      lock.release()
    })
  })

  it('should fail to aquireAll if one resource is not available', async () => {
    const lock = await lockManager.acquire({ resourceId: 'asdf' })
    setTimeout(() => {
      lock.release()
    }, 15)

    await expect(async () => lockManager.acquireAll({
      resourceIds: ['asdf', 'jklo'],
      timeout: 10,
    })).rejects.toThrowError(new ErrorWithCode('', ErrorCode.LockManagerAquireTimeout))
  })

  it('should aquire all locks as soon as all locks are available', async () => {
    const lock = await lockManager.acquire({ resourceId: 'asdf' })
    setTimeout(() => {
      lock.release()
    }, 5)

    const locks = await lockManager.acquireAll({
      resourceIds: ['asdf', 'jklo'],
      timeout: 10,
    })

    expect(locks.length).toBe(2)
    locks.forEach(lock => {
      expect(lock).toBeInstanceOf(Lock)
      lock.release()
    })
  })

  it('should release all locks to be re-aquired if aquireAll fails', async () => {
    const lock = await lockManager.acquire({ resourceId: 'asdf' })
    setTimeout(() => {
      lock.release()
    }, 15)
    try {
      await lockManager.acquireAll({
        resourceIds: ['asdf', 'jklo'],
        timeout: 10,
      })
    } catch {
      // this is expected, as asdf is locked
    }

    const locks = await lockManager.acquireAll({
      resourceIds: ['asdf', 'jklo'],
      timeout: 10,
    })

    expect(locks.length).toBe(2)
    locks.forEach(lock => {
      expect(lock).toBeInstanceOf(Lock)
      lock.release()
    })
  })
})
