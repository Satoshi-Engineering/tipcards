import { Router, Request, Response, NextFunction } from 'express'

import type { Card } from '@shared/data/api/Card'
import { ErrorCode, ErrorWithCode, ToErrorResponse } from '@shared/data/Errors'
import { decodeLnurl } from '@shared/modules/lnurlHelpers'

import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { getCardByHash } from '@backend/database/queries'
import { lockCard, releaseCard } from '@backend/services/cardLockMiddleware'
import {
  checkIfCardIsPaidAndCreateWithdrawId,
  checkIfCardIsUsed,
  getLnurlpForNewCard,
  getLnurlpForCard,
  loadCurrentLnurlFromLnbitsByWithdrawId,
  getLnurlResponse,
} from '@backend/services/lnbitsHelpers'

const router = Router()

const toErrorResponse: ToErrorResponse = (message: string, code?: ErrorCode) => ({
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
    res.status(500).json(toErrorResponse('Unknown database error.', ErrorCode.UnknownDatabaseError))
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
      res.status(500).json(toErrorResponse('Unable to create LNURL-P at lnbits.', ErrorCode.UnableToCreateLnurlP))
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
      res.status(500).json(toErrorResponse('Unable to check invoice status at lnbits.', code))
      next()
      return
    }
  }

  // create + return lnurlp for unfunded card
  if (card.lnbitsWithdrawId == null) {
    if (card.invoice != null) {
      res.status(400).json(toErrorResponse('This card has an invoice. Pay or reset the invoice first in your browser.', ErrorCode.CannotCreateLnurlPCardHasInvoice))
      next()
      return
    }

    if (card.setFunding != null) {
      res.status(400).json(toErrorResponse('This card is being funded via set funding.', ErrorCode.CardNeedsSetFunding))
      next()
      return
    }

    try {
      const data = await getLnurlpForCard(card)
      res.json(data)
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json(toErrorResponse('Unable to create LNURL-P at lnbits.', ErrorCode.UnableToCreateLnurlP))
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
      res.status(500).json(toErrorResponse('Unable to check withdraw status at lnbits.', code))
      next()
      return
    }
  }
  if (card.used != null) {
    res.status(400).json(toErrorResponse('Card has already been used.', ErrorCode.WithdrawHasBeenSpent))
    next()
    return
  }

  let lnurl = null
  try {
    lnurl = await loadCurrentLnurlFromLnbitsByWithdrawId(card.lnbitsWithdrawId)
  } catch (error) {
    console.error(ErrorCode.UnableToGetLnurl, error)
    res.status(500).json(toErrorResponse('Unable to get LNURL from lnbits.', ErrorCode.UnableToGetLnurl))
    next()
    return
  }

  if (lnurl == null) {
    res.status(404).json(toErrorResponse('WithdrawId not found at lnbits.', ErrorCode.CardByHashNotFound))
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
    res.status(500).json(toErrorResponse('Unable to resolve LNURL at lnbits.', ErrorCode.UnableToResolveLnbitsLnurl))
  }
  next()
}

/**
 * LNURL response when cards are scanned directly
 */
router.get(
  '/:cardHash',
  lockCard(toErrorResponse),
  routeHandler,
  releaseCard,
)

export default router
