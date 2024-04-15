import { Router, Request, Response, NextFunction } from 'express'

import type { Card } from '@shared/data/api/Card'
import { ErrorCode, ErrorWithCode, ToErrorResponse } from '@shared/data/Errors'
import { decodeLnurl } from '@shared/modules/lnurlHelpers'

import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { getCardByHash } from '@backend/database/queries'
import { lockCardMiddleware, releaseCardMiddleware } from '@backend/services/databaseCardLock'
import {
  checkIfCardIsPaidAndCreateWithdrawId,
  checkIfCardIsUsed,
  getLnurlpForNewCard,
  getLnurlpForCard,
  loadCurrentLnurlFromLnbitsByWithdrawId,
  getLnurlResponse,
  lnurlwCreationHappenedInLastTwoMinutes,
} from '@backend/services/lnbitsHelpers'

const router = Router()

const toErrorResponse: ToErrorResponse = ({ message, code }) => ({
  status: 'ERROR',
  reason: message,
  code,
})

const routeHandler = async (req: Request, res: Response, next: NextFunction) => {
  const cardHash = req.params.cardHash

  let card: Card | null = null

  // load card from database
  try {
    const cardRedis = await getCardByHash(cardHash)
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

  // create + return lnurlp for unfunded card
  if (card == null) {
    try {
      const data = await getLnurlpForNewCard(cardHash)
      res.json(data)
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json(toErrorResponse({
        message: 'Unable to create LNURL-P at lnbits.',
        code: ErrorCode.UnableToCreateLnurlP,
      }))
    }
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

  // create + return lnurlp for unfunded card
  if (card.lnbitsWithdrawId == null) {
    if (card.invoice != null) {
      res.status(400).json(toErrorResponse({
        message: 'This card has an invoice. Pay or reset the invoice first in your browser.',
        code: ErrorCode.CannotCreateLnurlPCardHasInvoice,
      }))
      next()
      return
    }

    if (card.setFunding != null) {
      res.status(400).json(toErrorResponse({
        message: 'This card is being funded via set funding.',
        code: ErrorCode.CardNeedsSetFunding,
      }))
      next()
      return
    }

    try {
      const data = await getLnurlpForCard(card)
      res.json(data)
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json(toErrorResponse({
        message: 'Unable to create LNURL-P at lnbits.',
        code: ErrorCode.UnableToCreateLnurlP,
      }))
    }
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
  if (card.used != null) {
    res.status(400).json(toErrorResponse({
      message: 'Card has already been used.',
      code: ErrorCode.WithdrawHasBeenSpent,
    }))
    next()
    return
  }

  // check if card withdraw is pending
  if (card.withdrawPending) {
    if (!(await lnurlwCreationHappenedInLastTwoMinutes(card.lnbitsWithdrawId))) {
      console.error(`Card ${card.cardHash} withdraw is pending for more than 2 minutes and user tried again.`)
    }
    res.status(400).json(toErrorResponse({
      message: 'Card has already been used, but the payment is still pending.',
      code: ErrorCode.WithdrawIsPending,
    }))
    next()
    return
  }

  let lnurl = null
  try {
    lnurl = await loadCurrentLnurlFromLnbitsByWithdrawId(card.lnbitsWithdrawId)
  } catch (error) {
    console.error(ErrorCode.UnableToGetLnurl, error)
    res.status(500).json(toErrorResponse({
      message: 'Unable to get LNURL from lnbits.',
      code: ErrorCode.UnableToGetLnurl,
    }))
    next()
    return
  }

  if (lnurl == null) {
    res.status(404).json(toErrorResponse({
      message: 'WithdrawId not found at lnbits.',
      code: ErrorCode.CardByHashNotFound,
    }))
    next()
    return
  }

  try {
    const response = await getLnurlResponse(decodeLnurl(lnurl))
    res.json(response.data)
  } catch (error) {
    console.error(
      `Unable to resolve lnurlw at lnbits for card ${card.cardHash}`,
      error,
    )
    res.status(500).json(toErrorResponse({
      message: 'Unable to resolve LNURL at lnbits.',
      code: ErrorCode.UnableToResolveLnbitsLnurl,
    }))
  }
  next()
}

/**
 * LNURL response when cards are scanned directly
 */
router.get(
  '/:cardHash',
  lockCardMiddleware(toErrorResponse),
  routeHandler,
  releaseCardMiddleware,
)

export default router
