import type { Request, Response, NextFunction } from 'express'

import { ErrorCode, ErrorWithCode, type ToErrorResponse } from '@shared/data/Errors.js'

import Lock from '@backend/services/locking/Lock.js'
import CardLockManager from '@backend/domain/CardLockManager.js'

/**
 * USAGE OF THIS MIDDLEWARE
 * 1. make sure the route has a cardHash parameter
 * 2. use the lockCardMiddleware before the route implemenation to lock the card
 * 3. use the releaseCardMiddleware after the route implementation to release the lock
 * 4. make sure to call the next() function in the route implementation so the card gets released after the route is done
 */

export const lockCardMiddleware = (toError: ToErrorResponse, cardLockManager: CardLockManager) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const cardHash = req.params.cardHash

    if (!cardHash) {
      res.status(400).json(toError({
        message: 'Card hash is required.',
        code: ErrorCode.CardHashRequired,
      }))
      return
    }

    try {
      const lock = await cardLockManager.lockCard(cardHash)
      res.locals.lock = lock
    } catch (error) {
      let code = ErrorCode.UnableToLockCard
      if (error instanceof ErrorWithCode) {
        code = error.code
      }
      console.error(code, error)
      res.status(500).json(toError({
        message: 'Unable to access card, please try again later.',
        code,
      }))
      return
    }
    next()
  }

export const releaseCardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.params.cardHash) {
    console.error('releaseCard called without cardHash', req)
    return
  }
  if (!res.locals.lock) {
    console.error(`releaseCard called without lock for cardHash ${req.params.cardHash}`, req, res.locals.lock)
    return
  }

  safeReleaseLock(res.locals.lock)

  next()
}

const safeReleaseLock = (lock: Lock) => {
  try {
    lock.release()
  } catch (error) {
    console.error(`Error releasing card lock for card ${lock.resourceId} with lock (id:${lock.id}, resourceId:${lock.resourceId}`, error)
  }
}
