import express from 'express'

import { ErrorCode } from '../data/Errors'
import type { Card } from '../data/Card'
import { getCardByHash } from '../services/database'
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
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
    })
    console.error(error)
    return
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
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unable to get LNURL from lnbits.',
      code: ErrorCode.UnableToGetLnurl,
    })
    console.error(error)
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
    res.status(500).json({
      status: 'ERROR',
      reason: 'Unable to resolve LNURL at lnbits.',
      code: ErrorCode.UnableToResolveLnurl,
    })
  }
})

export default router
