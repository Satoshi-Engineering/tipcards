import express from 'express'

import { getCardByHash } from '../services/database'
import { checkIfCardIsUsed } from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN } from '../constants'
import type { Card } from '../../../src/data/Card'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'
import { getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'

const router = express.Router()

const cardUsed = async (req: express.Request, res: express.Response) => {
  // 1. check if card exists
  let card: Card | null = null
  try {
    card = await getCardByHash(req.params.cardHash)
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
