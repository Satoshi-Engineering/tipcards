import axios from 'axios'
import express from 'express'

import {
  createCard, getSetById, createSet, deleteSet,
  deleteCard, getCardByHash,
} from '../services/database'
import hashSha256 from '../services/hashSha256'
import { checkIfSetInvoiceIsPaid } from '../services/lnbitsHelpers'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY } from '../constants'
import type { Card } from '../../../src/data/Card'
import type { Set } from '../../../src/data/Set'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'
import { LNBITS_ORIGIN } from '../../../src/constants'

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

router.post('/invoice/:setId', async (req: express.Request, res: express.Response) => {
  // amount in sats
  let amountPerCard: number | undefined = undefined
  let text = ''
  let note = ''
  let cardIndices: number[] = []
  try {
    ({ amountPerCard, text, note, cardIndices } = req.body)
  } catch (error) {
    console.error(error)
  }
  if (amountPerCard == null || amountPerCard < 21 || cardIndices.length < 1) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input.',
    })
    return
  }

  // check if set/invoice already exists
  let set: Set | null = null
  try {
    set = await getSetById(req.params.setId)
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (set?.invoice != null) {
    if (set.invoice.paid != null) {
      res.status(400).json({
        status: 'error',
        message: 'Set is already funded.',
      })
    }  else {
      res.status(400).json({
        status: 'error',
        message: 'Set invoice already exists.',
      })
    }
    return
  }

  // create invoice in lnbits
  const amount = amountPerCard * cardIndices.length
  let payment_hash: string | undefined = undefined
  let payment_request: string | undefined = undefined
  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/api/v1/payments`, {
      out: false,
      amount,
      memo: 'Fund your Lightning Tip Card',
      webhook: `${TIPCARDS_API_ORIGIN}/api/set/invoice/paid/${req.params.setId}`,
    }, {
      headers: {
        'Content-type': 'application/json',
        'X-Api-Key': LNBITS_INVOICE_READ_KEY,
      },
    })
    ;({ payment_hash, payment_request } = response.data)
  } catch (error) {
    console.error(ErrorCode.UnableToCreateLnbitsInvoice, error)
  }
  if (payment_hash == null || payment_request == null) {
    res.status(500).json({
      status: 'error',
      message: 'Unable to create invoice at lnbits.',
      code: ErrorCode.UnableToCreateLnbitsInvoice,
    })
    return
  }
  set = {
    id: req.params.setId,
    text,
    note,
    invoice: {
      fundedCards: cardIndices,
      amount,
      payment_hash,
      payment_request,
      created: Math.round(+ new Date() / 1000),
      paid: null,
      expired: false,
    },
  }

  // persist data
  try {
    await Promise.all(cardIndices.map(async (index) => {
      const cardHash = await hashSha256(`${req.params.setId}/${index}`)
      await createCard({
        cardHash,
        text,
        note,
        setFunding: {
          amount: typeof amountPerCard === 'number' ? amountPerCard : 0,
          created: Math.round(+ new Date() / 1000),
          paid: null,
        },
        invoice: null,
        lnurlp: null,
        lnbitsWithdrawId: null,
        used: null,
      })
    }))
    await createSet(set)
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
    data: set,
  })
})

router.delete('/invoice/:setId', async (req: express.Request, res: express.Response) => {
  // 1. check if set exists
  let set: Set | null = null
  try {
    set = await getSetById(req.params.setId)
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (set?.invoice == null) {
    res.status(404).json({
      status: 'error',
      message: `Set not found. Go to /set-funding/${req.params.setId} to create an invoice.`,
    })
    return
  }

  // 2. check if invoice is already paid and used
  try {
    await checkIfSetInvoiceIsPaid(set)
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
  if (set.invoice?.paid != null) {
    res.status(400).json({
      status: 'error',
      message: 'This set invoice is already funded and cannot be deleted anymore!',
      code: ErrorCode.CannotDeleteFundedSet,
    })
    return
  }

  // 3. delete set+cards in database
  try {
    // delete all cards
    await Promise.all(set.invoice.fundedCards.map(async (cardIndex) => {
      if (set == null) {
        return
      }
      const cardHash = await hashSha256(`${set.id}/${cardIndex}`)
      const card: Card | null = await getCardByHash(cardHash)
      if (card?.setFunding == null) {
        return
      }
      await deleteCard(card)
    }))

    // delete set
    await deleteSet(set)
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
  })
})

const invoicePaid = async (req: express.Request, res: express.Response) => {
  // 1. check if set exists
  let set: Set | null = null
  try {
    set = await getSetById(req.params.setId)
  } catch (error) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }
  if (set?.invoice == null) {
    res.status(404).json({
      status: 'error',
      message: `Set not found. Go to /set-funding/${req.params.setId} to create an invoice.`,
    })
    return
  }

  // 2. check if invoice is paid
  try {
    await checkIfSetInvoiceIsPaid(set)
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
  res.json({
    status: 'success',
    data: set,
  })
}

router.get('/invoice/paid/:cardHash', invoicePaid)
router.post('/invoice/paid/:cardHash', invoicePaid)

export default router
