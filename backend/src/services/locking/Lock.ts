import { randomUUID } from 'crypto'

import LockManager from './LockManager.js'

export default class Lock {

  constructor(lockManager: LockManager, resourceId: string) {
    this._id = randomUUID()
    this.lockManager = lockManager
    this._resourceId = resourceId
  }

  release() {
    this.lockManager.release(this)
  }

  get id() {
    return this._id
  }

  get resourceId() {
    return this._resourceId
  }

  private _id
  private _resourceId
  private lockManager
}
