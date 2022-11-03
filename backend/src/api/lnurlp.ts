import express from 'express'

import { getCardByHash } from '../services/database'
import {
  getLnurlpForNewCard,
  getLnurlpForCard,
  checkIfCardLnurlpIsPaid,
  checkIfCardIsPaidAndCreateWithdrawId,
} from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN } from '../constants'
import type { Card } from '../../../src/data/Card'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'
import { getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'

const router = express.Router()

/**
 * Create multi funding lnurlp link
 */
router.post('/create/:cardHash', async (req: express.Request, res: express.Response) => {
  // check if card/invoice already exists
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

  // create + return lnurlp for new card
  if (card == null) {
    try {
      await getLnurlpForNewCard(req.params.cardHash, true)
      res.json({
        status: 'success',
      })
    } catch (error) {
      console.error(ErrorCode.UnableToCreateLnurlP, error)
      res.status(500).json({
        status: 'error',
        reason: 'Unable to create LNURL-P at lnbits.',
      })
    }
    return
  }
  
  // check status of card
  if (card.invoice != null) {
    if (card.invoice.paid != null) {
      res.status(400).json({
        status: 'error',
        message: 'Card is already funded.',
      })
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Card already has an invoice.',
      })
    }
    return
  }
  if (card.lnurlp?.paid != null) {
    res.status(400).json({
      status: 'error',
      message: 'Card is already funded.',
    })
    return
  }

  // create + return lnurlp for unfunded card
  try {
    await getLnurlpForCard(card, true)
    res.json({
      status: 'success',
    })
  } catch (error) {
    console.error(ErrorCode.UnableToCreateLnurlP, error)
    res.status(500).json({
      status: 'error',
      reason: 'Unable to create LNURL-P at lnbits.',
    })
  }
})

/**
 * Handle lnurlp link payment. Either single or multi funding.
 */
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

/**
 * Finish multi funding lnurlp link
 */
router.post('/finish/:cardHash', async (req: express.Request, res: express.Response) => {
  // check if card exists
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
      message: 'Card not found.',
    })
    return
  }
  if (!card.lnurlp?.multi) {
    res.status(400).json({
      status: 'error',
      message: 'Card is not a multi-fund card.',
    })
    return
  }

  // check if card has funding and set to "paid"
  try {
    await checkIfCardLnurlpIsPaid(card, true)
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
  if (!card.lnurlp.paid) {
    res.status(400).json({
      status: 'error',
      message: 'Card is not paid.',
      data: card,
    })
    return
  }

  res.json({
    status: 'success',
    data: card,
  })
})

export default router
