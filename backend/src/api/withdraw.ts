import { Router, type Request, type Response, type NextFunction } from 'express'

import type { Card } from '@shared/data/api/Card.js'
import { ErrorCode, ErrorWithCode, type ToErrorResponse } from '@shared/data/Errors.js'
import { getLandingPageLinkForCardHash } from '@shared/modules/cardUrlHelpers.js'

import { cardApiFromCardRedis } from '@backend/database/deprecated/transforms/cardApiFromCardRedis.js'
import { getCardByHash } from '@backend/database/deprecated/queries.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { checkIfCardIsUsed } from '@backend/services/lnbitsHelpers.js'
import { TIPCARDS_ORIGIN } from '@backend/constants.js'

import { emitCardUpdateForSingleCard } from './middleware/emitCardUpdates.js'
import { lockCardMiddleware, releaseCardMiddleware } from './middleware/handleCardLock.js'

export default (
  applicationEventEmitter: ApplicationEventEmitter,
  cardLockManager: CardLockManager,
) => {
  const toErrorResponse: ToErrorResponse = ({ message, code }) => ({
    status: 'error',
    message,
    code,
  })

  const router = Router()

  const cardUsed = async (req: Request, res: Response, next: NextFunction) => {
    // 1. check if card exists
    let card: Card | null = null
    try {
      const cardRedis = await getCardByHash(req.params.cardHash)
      if (cardRedis != null) {
        card = cardApiFromCardRedis(cardRedis)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json({
        status: 'error',
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      })
      next()
      return
    }
    if (card == null) {
      res.status(404).json({
        status: 'error',
        message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      })
      next()
      return
    }
    if (card.lnbitsWithdrawId == null) {
      res.status(404).json({
        status: 'error',
        message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      })
      next()
      return
    }
    if (card.used != null) {
      res.json({
        status: 'success',
        data: { cardUsed: card.used, cardHash: card.cardHash },
      })
      next()
      return
    }

    // check lnbits if the card is used
    try {
      await checkIfCardIsUsed(card, true)
    } catch (error: unknown) {
      let code = ErrorCode.UnknownErrorWhileCheckingWithdrawStatus
      let errorToLog = error
      if (error instanceof ErrorWithCode) {
        code = error.code
        errorToLog = error.error
      }
      console.error(code, errorToLog)
      res.status(500).json({
        status: 'error',
        message: 'Unable to check withdraw status at lnbits.',
        code,
      })
      next()
      return
    }
    res.json({
      status: 'success',
      data: { cardUsed: card.used, cardHash: card.cardHash },
    })
    next()
  }

  router.get(
    '/used/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardUsed,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )
  router.post(
    '/used/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardUsed,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  return router
}
