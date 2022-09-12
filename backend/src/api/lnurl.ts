import express from 'express'

import { ErrorCode, ErrorWithCode } from '../data/Errors'
import type { Card } from '../data/Card'
import { getCardByHash } from '../services/database'
import { checkIfCardInvoiceIsPaidAndCreateWithdrawId, checkIfCardIsUed } from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN } from '../constants'
import { decodeLnurl, getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'
import { loadLnurlsFromLnbitsByWithdrawId } from '../../../src/modules/lnbitsHelpers'
import axios from 'axios'

const router = express.Router()

router.get('/:cardHash', async (req: express.Request, res: express.Response) => {
  let card: Card | null = null
  const responseData: {
    amount: number | undefined,
    invoiceCreated: number | undefined,
    invoicePaid: number | null | undefined,
    cardUsed: number | null | undefined,
  } = {
    amount: undefined,
    invoiceCreated: undefined,
    invoicePaid: undefined,
    cardUsed: undefined,
  }

  // load card from database
  try {
    card = await getCardByHash(req.params.cardHash)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
      data: responseData,
    })
    return
  }
  if (card == null) {
    res.status(404).json({
      status: 'ERROR',
      message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      code: ErrorCode.CardByHashNotFound,
      data: responseData,
    })
    return
  }
  responseData.amount = card.invoice.amount
  responseData.invoiceCreated = card.invoice.created

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
        status: 'ERROR',
        message: 'Unable to check invoice status at lnbits.',
        code: code,
        data: responseData,
      })
      return
    }
  }
  if (card.lnbitsWithdrawId == null) {
    res.status(404).json({
      status: 'ERROR',
      message: `Card has not been funded yet. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      code: ErrorCode.CardByHashNotFound,
      data: responseData,
    })
    return
  }
  responseData.invoicePaid = card.invoice.paid

  // check if card is already used
  if (card.used == null) {
    try {
      await checkIfCardIsUed(card)
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
        message: 'Unable to check withdraw status at lnbits.',
        code: code,
        data: responseData,
      })
      return
    }
  }
  responseData.cardUsed = card.used
  if (card.used != null) {
    res.status(400).json({
      status: 'ERROR',
      message: 'Card has already been used.',
      code: ErrorCode.CardByHashNotFound,
      data: responseData,
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
      data: responseData,
    })
    return
  }

  if (lnurl == null) {
    res.status(404).json({
      status: 'ERROR',
      reason: 'WithdrawId not found at lnbits.',
      code: ErrorCode.CardByHashNotFound,
      data: responseData,
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
      data: responseData,
    })
  }
})

export default router
