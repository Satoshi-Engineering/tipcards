import type { Request, Response, NextFunction } from 'express'

import { ErrorCode, type ToErrorResponse } from '@shared/data/Errors.js'

import { lockCard, releaseCards } from '@backend/services/databaseCardLock.js'

/**
 * USAGE OF THIS MIDDLEWARE
 * 1. make sure the route has a cardHash parameter
 * 2. use the lockCardMiddleware before the route implemenation to lock the card
 * 3. use the releaseCardMiddleware after the route implementation to release the lock
 * 4. make sure to call the next() function in the route implementation so the card gets released after the route is done
 */
export const lockCardMiddleware = (toError: ToErrorResponse) => async (req: Request, res: Response, next: NextFunction) => {
  const cardHash = req.params.cardHash

  if (!cardHash) {
    res.status(400).json(toError({
      message: 'Card hash is required.',
      code: ErrorCode.CardHashRequired,
    }))
    return
  }

  try {
    const lockValue = await lockCard(cardHash)
    res.locals.lockValue = lockValue
  } catch (error) {
    console.error(ErrorCode.UnableToLockCard, error)
    res.status(500).json(toError({
      message: 'Unable to access card, please try again later.',
      code: ErrorCode.UnableToLockCard,
    }))
    return
  }
  next()
}


export const releaseCardMiddleware = async (req: Request, res: Response) => {
  if (!req.params.cardHash) {
    console.error('releaseCard called without cardHash', req)
    return
  }
  if (!res.locals.lockValue) {
    console.error(`releaseCard called without lockValue for cardHash ${req.params.cardHash}`, req, res.locals.lockValue)
    return
  }
  await releaseCards([{ cardHash: req.params.cardHash, lockValue: res.locals.lockValue }])
}
