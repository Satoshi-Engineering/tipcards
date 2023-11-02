import express from 'express'

import type { BulkWithdraw } from '@shared/data/redis/BulkWithdraw'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors'

import { getBulkWithdrawById, updateBulkWithdraw, getCardByHash, updateCard } from '@backend/services/database'
import { isBulkWithdrawWithdrawn } from '@backend/services/lnbitsHelpers'

const router = express.Router()

const bulkWithdrawWithdrawn = async (req: express.Request, res: express.Response) => {
  // 1. check if bulkwithdraw exists
  let bulkWithdraw: BulkWithdraw | null = null
  try {
    bulkWithdraw = await getBulkWithdrawById(req.params.bulkWithdrawId)
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (bulkWithdraw == null) {
    res.status(404).json({
      status: 'error',
      message: 'BulkWithdraw not found.',
    })
    return
  }
  if (bulkWithdraw.withdrawn != null) {
    res.json({
      status: 'success',
      data: { withdrawn: bulkWithdraw.withdrawn },
    })
    return
  }

  // 2. check lnbits if withdrawn
  let withdrawn = false
  try {
    withdrawn = await isBulkWithdrawWithdrawn(bulkWithdraw)
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
  if (!withdrawn) {
    res.status(400).json({
      status: 'error',
      message: 'BulkWithdraw not withdrawn.',
    })
    return
  }

  // 3. update database and return withdraw
  bulkWithdraw.withdrawn = Math.round(+ new Date() / 1000)
  try {
    await updateBulkWithdraw(bulkWithdraw)
    await Promise.all(bulkWithdraw.cards.map(async (cardHash) => {
      const card = await getCardByHash(cardHash)
      if (card == null) {
        return
      }
      card.used = Math.round(+ new Date() / 1000)
      await updateCard(card)
    }))
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  res.json({
    status: 'success',
    data: { withdrawn: bulkWithdraw.withdrawn },
  })
}

router.get('/withdrawn/:bulkWithdrawId', bulkWithdrawWithdrawn)
router.post('/withdrawn/:bulkWithdrawId', bulkWithdrawWithdrawn)

export default router
