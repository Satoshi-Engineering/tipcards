import express from 'express'

import type { Card as CardApi } from '@shared/data/api/Card'
import { cardApiFromCardRedis } from '@shared/data/transforms/cardApiFromCardRedis'
import { cardRedisFromCardApi } from '@shared/data/transforms/cardRedisFromCardApi'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors'

import { getCardByHash, updateCard } from '../services/database'
import { checkIfCardIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '../services/lnbitsHelpers'

const router = express.Router()

router.get('/')

router.get('/:cardHash', async (req: express.Request, res: express.Response) => {
  let card: CardApi | null = null

  // load card from database
  try {
    const cardRedis = await getCardByHash(req.params.cardHash)
    if (cardRedis != null) {
      card = cardApiFromCardRedis(cardRedis)
    }
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      reason: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (card == null) {
    res.status(404).json({
      status: 'error',
      reason: 'Card has not been funded yet. Scan the QR code with your QR code scanner and open the URL in your browser to fund it.',
      code: ErrorCode.CardByHashNotFound,
    })
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
      res.status(500).json({
        status: 'error',
        reason: 'Unable to check invoice status at lnbits.',
        code,
      })
      return
    }
  }
  if (card.lnbitsWithdrawId == null && !card.isLockedByBulkWithdraw) {
    res.json({
      status: 'success',
      data: card,
    })
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
      res.status(500).json({
        status: 'error',
        reason: 'Unable to check withdraw status at lnbits.',
        code,
      })
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
})

export default router
