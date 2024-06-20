import { Router, Request, Response, NextFunction } from 'express'

import type { Card as CardApi } from '@shared/data/api/Card'
import { ErrorCode, ErrorWithCode, ToErrorResponse } from '@shared/data/Errors'

import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { getCardByHash } from '@backend/database/queries'
import { checkIfCardIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '@backend/services/lnbitsHelpers'

import { lockCardMiddleware, releaseCardMiddleware } from './middleware/handleCardLock'

const router = Router()

const toErrorResponse: ToErrorResponse = ({ message, code }) => ({
  status: 'error',
  message,
  code,
})

const routeHandler = async (req: Request, res: Response, next: NextFunction) => {
  let card: CardApi | null = null

  // load card from database
  try {
    const cardRedis = await getCardByHash(req.params.cardHash)
    if (cardRedis != null) {
      card = cardApiFromCardRedis(cardRedis)
    }
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json(toErrorResponse({
      message: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
    }))
    next()
    return
  }
  if (card == null) {
    res.status(404).json(toErrorResponse({
      message: 'Card has not been funded yet. Scan the QR code with your QR code scanner and open the URL in your browser to fund it.',
      code: ErrorCode.CardByHashNotFound,
    }))
    next()
    return
  }

  // check if invoice is already paid and get withdrawId
  if (card.lnbitsWithdrawId == null) {
    try {
      await checkIfCardIsPaidAndCreateWithdrawId(card)
    } catch (error: unknown) {
      let code = ErrorCode.UnknownErrorWhileCheckingInvoiceStatus
      let errorToLog = error
      if (error instanceof ErrorWithCode) {
        code = error.code
        errorToLog = error.error
      }
      console.error(code, errorToLog)
      res.status(500).json(toErrorResponse({
        message: 'Unable to check invoice status at lnbits.',
        code,
      }))
      next()
      return
    }
  }
  if (card.lnbitsWithdrawId == null && !card.isLockedByBulkWithdraw) {
    res.json({
      status: 'success',
      data: card,
    })
    next()
    return
  }

  // check if card is already used
  if (card.used == null) {
    try {
      await checkIfCardIsUsed(card)
    } catch (error: unknown) {
      let code = ErrorCode.UnknownErrorWhileCheckingWithdrawStatus
      let errorToLog = error
      if (error instanceof ErrorWithCode) {
        code = error.code
        errorToLog = error.error
      }
      console.error(code, errorToLog)
      res.status(500).json(toErrorResponse({
        message: 'Unable to check withdraw status at lnbits.',
        code,
      }))
      next()
      return
    }
  }

  res.json({
    status: 'success',
    data: card,
  })
  next()
}

router.get('/')

router.get(
  '/:cardHash',
  lockCardMiddleware(toErrorResponse),
  routeHandler,
  releaseCardMiddleware,
)

export default router
