import axios from 'axios'
import express from 'express'

import { getCardByHash } from '../services/database'
import {
  checkIfCardIsPaidAndCreateWithdrawId,
  checkIfCardIsUsed,
  getLnurlpForNewCard,
  getLnurlpForCard,
} from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN, LNBITS_INVOICE_READ_KEY } from '../constants'
import type { Card } from '../../../src/data/Card'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'
import { decodeLnurl } from '../../../src/modules/lnurlHelpers'
import { loadLnurlsFromLnbitsByWithdrawId } from '../../../src/modules/lnbitsHelpers'
import { getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'
import { LNBITS_ORIGIN } from '../../../src/constants'

const router = express.Router()

router.get('/:cardHash', async (req: express.Request, res: express.Response) => {
  let card: Card | null = null

  // load card from database
  try {
    card = await getCardByHash(req.params.cardHash)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }

  // create + return lnurlp for unfunded card
  if (card == null) {
    try {
      const data = await getLnurlpForNewCard(req.params.cardHash)
      res.json(data)
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json({
        status: 'ERROR',
        reason: 'Unable to create LNURL-P at lnbits.',
        code: ErrorCode.UnableToCreateLnurlP,
      })
    }
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
        status: 'ERROR',
        reason: 'Unable to check invoice status at lnbits.',
        code,
      })
      return
    }
  }

  // create + return lnurlp for unfunded card
  if (card.lnbitsWithdrawId == null) {
    try {
      const data = await getLnurlpForCard(card)
      res.json(data)
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json({
        status: 'ERROR',
        reason: 'Unable to create LNURL-P at lnbits.',
        code: ErrorCode.UnableToCreateLnurlP,
      })
    }
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
        status: 'ERROR',
        reason: 'Unable to check withdraw status at lnbits.',
        code,
      })
      return
    }
  }
  if (card.used != null) {
    res.status(400).json({
      status: 'ERROR',
      reason: 'Card has already been used.',
      code: ErrorCode.WithdrawHasBeenSpent,
    })
    return
  }

  let lnurl = null
  try {
    const lnurls = await loadLnurlsFromLnbitsByWithdrawId(card.lnbitsWithdrawId)
    lnurl = lnurls[0]
  } catch (error) {
    console.error(ErrorCode.UnableToGetLnurl, error)
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unable to get LNURL from lnbits.',
      code: ErrorCode.UnableToGetLnurl,
    })
    return
  }

  if (lnurl == null) {
    res.status(404).json({
      status: 'ERROR',
      reason: 'WithdrawId not found at lnbits.',
      code: ErrorCode.CardByHashNotFound,
    })
    return
  }

  try {
    const response = await axios.get(decodeLnurl(lnurl))
    res.json(response.data)
  } catch (error) {
    console.error(ErrorCode.UnableToResolveLnbitsLnurl, error)
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unable to resolve LNURL at lnbits.',
      code: ErrorCode.UnableToResolveLnbitsLnurl,
    })
  }
})

const cardPaid = async (req: express.Request, res: express.Response) => {
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
  if (card?.lnurlp == null) {
    res.status(404).json({
      status: 'error',
      message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }

  // 2. check if card already has withdrawId
  if (card.lnbitsWithdrawId != null) {
    res.json({
      status: 'success',
      data: 'paid',
    })
    return
  }

  // 3. check if card is paid and create withdrawId
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
      message: 'Unable to check invoice status at lnbits.',
      code,
    })
    return
  }
  if (card.invoice?.paid || card.lnurlp?.paid) {
    res.json({
      status: 'success',
      data: 'paid',
    })
    return
  }
  res.json({
    status: 'success',
    data: 'not_paid',
  })
}
router.get('/paid/:cardHash', cardPaid)
router.post('/paid/:cardHash', cardPaid)

export default router
