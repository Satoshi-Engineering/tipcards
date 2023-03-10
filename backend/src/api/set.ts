import express from 'express'

import { getSetById } from '../services/database'
import { checkIfSetInvoiceIsPaid } from '../services/lnbitsHelpers'
import type { Set } from '../../../src/data/Set'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'

const router = express.Router()

router.get('/:setId', async (req: express.Request, res: express.Response) => {
  let set: Set | null = null

  // load set from database
  try {
    set = await getSetById(req.params.setId)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'Unknown database error.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (set == null) {
    res.status(404).json({
      status: 'error',
      message: 'Set not found.',
      code: ErrorCode.SetNotFound,
    })
    return
  }

  // check if invoice is already paid
  if (set.invoice?.paid == null) {
    try {
      await checkIfSetInvoiceIsPaid(set)
    } catch (error: unknown) {
      let code = ErrorCode.UnknownErrorWhileCheckingSetInvoiceStatus
      let errorToLog = error
      if (error instanceof ErrorWithCode) {
        code = error.code
        errorToLog = error.error
      }
      console.error(code, errorToLog)
      res.status(500).json({
        status: 'error',
        message: 'Unable to check set invoice status at lnbits.',
        code,
      })
      return
    }
  }

  res.json({
    status: 'success',
    data: set,
  })
})

export default router
