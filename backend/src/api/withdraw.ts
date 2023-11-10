import { Router, type Request, type Response } from 'express'

import type { Card } from '@shared/data/api/Card'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors'
import { getLandingPageLinkForCardHash } from '@shared/modules/lnurlHelpers'

import { cardApiFromCardRedis } from '@backend/database/redis/transforms/cardApiFromCardRedis'
import { getCardByHash } from '@backend/services/database'
import { checkIfCardIsUsed } from '@backend/services/lnbitsHelpers'
import { TIPCARDS_ORIGIN } from '@backend/constants'

const router = Router()

const cardUsed = async (req: Request, res: Response) => {
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
    return
  }
  if (card == null) {
    res.status(404).json({
      status: 'error',
      message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }
  if (card.lnbitsWithdrawId == null) {
    res.status(404).json({
      status: 'error',
      message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }
  if (card.used != null) {
    res.json({
      status: 'success',
      data: { cardUsed: card.used },
    })
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
    return
  }
  res.json({
    status: 'success',
    data: { cardUsed: card.used },
  })
}

router.get('/used/:cardHash', cardUsed)
router.post('/used/:cardHash', cardUsed)

export default router
