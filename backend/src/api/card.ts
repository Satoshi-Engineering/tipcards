import { Router, Request, Response, NextFunction } from 'express'

import type { Card as CardApi } from '@shared/data/api/Card'
import { ErrorCode, ErrorWithCode, ToErrorResponse } from '@shared/data/Errors'

import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { cardRedisFromCardApi } from '@backend/database/redis/transforms/cardRedisFromCardApi'
import { getCardByHash, updateCard } from '@backend/database/queries'
import { lockCard, releaseCard } from '@backend/services/cardLockMiddleware'
import { checkIfCardIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '@backend/services/lnbitsHelpers'

const router = Router()

const toErrorResponse: ToErrorResponse = (message: string, code?: ErrorCode) => ({
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
    res.status(500).json(toErrorResponse('Unknown database error.', ErrorCode.UnknownDatabaseError))
    next()
    return
  }
  if (card == null) {
    res.status(404).json(toErrorResponse('Card has not been funded yet. Scan the QR code with your QR code scanner and open the URL in your browser to fund it.', ErrorCode.CardByHashNotFound))
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
      res.status(500).json(toErrorResponse('Unable to check invoice status at lnbits.', code))
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
      res.status(500).json(toErrorResponse('Unable to check withdraw status at lnbits.', code))
      next()
      return
    }
  }

  // if card is not used and origin is the landing page mark the card as viewed
  if (
    card.used == null
    && card.landingPageViewed == null
    && req.query.origin === 'landing'
  ) {
    card.landingPageViewed = Math.round(+ new Date() / 1000)
    try {
      await updateCard(cardRedisFromCardApi(card))
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
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
  lockCard(toErrorResponse),
  routeHandler,
  releaseCard,
)

export default router
