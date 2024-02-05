import type { Request, Response, NextFunction } from 'express'

import { ErrorCode, ToErrorResponse } from '@shared/data/Errors'

import { lockCardByHash, releaseCardByHash } from '@backend/database/queries'

/**
 * USAGE OF THIS MIDDLEWARE
 * 1. make sure the route has a cardHash parameter
 * 2. use the lockCard middleware before the route implemenation to lock the card
 * 3. use the releaseCard middleware after the route implementation to release the lock
 * 4. make sure to call the next() function in the route implementation so the card gets released after the route is done
 */

export const lockCard = (toError: ToErrorResponse) => async (req: Request, res: Response, next: NextFunction) => {
  const cardHash = req.params.cardHash

  if (!cardHash) {
    res.json(toError({
      message: 'Card hash is required.',
      code: ErrorCode.CardHashRequired,
    }))
    return
  }

  let lockValue: string | null = null
  let lockAttempts = 0
  do {
    if (lockAttempts > 30) {
      console.error(`Cannot lock card ${cardHash} after 9 seconds of trying. It is currently locked by another process.`)
      res.json(toError({
        message: 'Unable to access card, please try again later.',
        code: ErrorCode.UnableToLockCard,
      }))
      return
    }
    lockAttempts++
    lockValue = await lockCardByHash(cardHash)
    if (lockValue != null) {
      res.locals.lockValue = lockValue
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }
  } while (lockValue == null)
  next()
}

export const releaseCard = async (req: Request, res: Response) => {
  if (!req.params.cardHash) {
    console.error('releaseCard called without cardHash', req)
    return
  }
  if (!res.locals.lockValue) {
    console.error(`releaseCard called without lockValue for cardHash ${req.params.cardHash}`, req, res.locals.lockValue)
    return
  }
  await releaseCardByHash(req.params.cardHash, res.locals.lockValue)
}
