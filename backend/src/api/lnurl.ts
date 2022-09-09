import express from 'express'

import { ErrorCode, ErrorWithCode } from '../data/Errors'
import type { Card } from '../data/Card'
import { getCardByHash } from '../services/database'
import { checkIfCardInvoiceIsPaidAndCreateWithdrawId } from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN } from '../constants'
import { decodeLnurl, getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'
import { loadLnurlsFromLnbitsByWithdrawId } from '../../../src/modules/lnbitsHelpers'
import axios from 'axios'

const router = express.Router()

router.get('/:cardHash', async (req: express.Request, res: express.Response) => {
  let card: Card | null = null
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
  if (card?.lnbitsWithdrawId == null && card?.invoice != null) {
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
      })
      return
    }
  }
  if (card?.lnbitsWithdrawId == null) {
    res.status(404).json({
      status: 'ERROR',
      message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      code: ErrorCode.CardByHashNotFound,
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

export default router
