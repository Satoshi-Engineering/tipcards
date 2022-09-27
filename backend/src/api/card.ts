import express from 'express'

import { getCardByHash } from '../services/database'
import { checkIfCardInvoiceIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '../services/lnbitsHelpers'
import type { Card } from '../../../src/data/Card'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'

const router = express.Router()

router.get('/:cardHash', async (req: express.Request, res: express.Response) => {
  let card: Card | null = null

  // load card from database
  try {
    card = await getCardByHash(req.params.cardHash)
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
      await checkIfCardInvoiceIsPaidAndCreateWithdrawId(card)
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
  if (card.lnbitsWithdrawId == null) {
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

  res.json({
    status: 'success',
    data: card,
  })
})

export default router
