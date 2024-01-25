import axios from 'axios'
import { Router, type Request, type Response } from 'express'

import type { AccessTokenPayload } from '@shared/data/auth'
import { Set as SetApi, type Settings } from '@shared/data/api/Set'
import { ErrorCode, ErrorWithCode } from '@shared/data/Errors'

import type { Set as SetRedis } from '@backend/database/redis/data/Set'
import {
  getSetById, getSetsByUserId,
  createSet, deleteSet, updateSet,
  createCard, deleteCard, getCardByHash,
} from '@backend/database/queries'
import hashSha256 from '@backend/services/hashSha256'
import { checkIfSetInvoiceIsPaid } from '@backend/services/lnbitsHelpers'
import { authGuardAccessToken } from '@backend/services/jwt'
import { TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ORIGIN } from '@backend/constants'

const router = Router()

/**
 * get all sets from the current user
 */
router.get('/', authGuardAccessToken, async (_, res) => {
  const accessTokenPayload: AccessTokenPayload = res.locals.accessTokenPayload
  if (accessTokenPayload == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization payload missing.',
      code: ErrorCode.AccessTokenMissing,
    })
    return
  }
  const userId: string = accessTokenPayload.id

  // load set from database
  let sets: SetRedis[] | null = null
  try {
    sets = await getSetsByUserId(userId)
  } catch (error: unknown) {
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
    data: sets ? sets.map((set) => SetApi.parse(set)) : null,
  })
})

router.post('/:setId', authGuardAccessToken, async (req, res) => {
  const accessTokenPayload: AccessTokenPayload = res.locals.accessTokenPayload
  if (accessTokenPayload == null) {
    res.status(401).json({
      status: 'error',
      message: 'Authorization payload missing.',
      code: ErrorCode.AccessTokenMissing,
    })
    return
  }
  const userId: string = accessTokenPayload.id
  let settings: Settings | null = null
  let created: number | null = null
  let date: number | null = null
  try {
    ({ settings, created, date } = req.body)
  } catch (error) {
    console.error(error)
  }

  let set: SetRedis | null = null
  // load set from database
  try {
    set = await getSetById(req.params.setId)
  } catch (error: unknown) {
    console.error(ErrorCode.UnknownDatabaseError, error)
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occured. Please try again later or contact an admin.',
      code: ErrorCode.UnknownDatabaseError,
    })
    return
  }

  // create a new set
  if (set == null) {
    set = {
      id: req.params.setId,
      userId,
      invoice: null,
      settings,
      created: Math.floor(+ new Date() / 1000),
      date: Math.floor(+ new Date() / 1000),
      text: '',
      note: '',
    }
    if (created != null) {
      set.created = created
    }
    if (date != null) {
      set.date = date
    }

    try {
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
      data: SetApi.parse(set),
    })
    return
  }

  // check if the set belongs to the current user
  if (set.userId != null && set.userId !== userId) {
    res.status(403).json({
      status: 'error',
      message: 'This set belongs to another user.',
      code: ErrorCode.SetBelongsToAnotherUser,
    })
    return
  }

  // update set
  set.userId = userId
  if (settings != null) {
    set.settings = settings
  }
  if (set.created == null) {
    if (created != null) {
      set.created = created
    } else if (set.date != null) {
      set.created = set.date
    } else if (date != null) {
      set.created = date
    } else {
      set.created = Math.floor(+ new Date() / 1000)
    }
  }
  if (date != null) {
    set.date = date
  } else {
    set.date = Math.floor(+ new Date() / 1000)
  }
  try {
    await updateSet(set)
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
    data: SetApi.parse(set),
  })
})

router.get('/:setId', async (req, res) => {
  let set: SetRedis | null = null

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
    data: SetApi.parse(set),
  })
})

router.post('/invoice/:setId', async (req, res) => {
  // amount in sats
  let amountPerCard: number | undefined = undefined
  let text = ''
  let note = ''
  let cardIndices: number[] = []
  try {
    amountPerCard = req.body.amountPerCard
    cardIndices = req.body.cardIndices
    text = req.body.text || ''
    note = req.body.note || ''
  } catch (error) {
    console.error(error)
  }
  if (amountPerCard == null || amountPerCard < 20 || amountPerCard > 2200000) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid amountPerCard, has to be between 21 and 2,100,000 sats.',
      code: ErrorCode.InvalidInput,
    })
    return
  }
  if (cardIndices.length < 1) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input, cardIndices missing.',
      code: ErrorCode.InvalidInput,
    })
    return
  }

  // check if set/invoice already exists
  let set: SetRedis | null = null
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
        code: ErrorCode.SetAlreadyFunded,
      })
    } else {
      res.status(400).json({
        status: 'error',
        message: 'Set invoice already exists.',
        code: ErrorCode.SetInvoiceAlreadyExists,
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
      memo: `Fund ${cardIndices.length} Lightning Tip Cards`,
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

  // check if a new set has to be created
  let insertNewSet = false
  if (set == null) {
    insertNewSet = true
    set = {
      id: req.params.setId,
      created: Math.floor(+ new Date() / 1000),
      date: Math.floor(+ new Date() / 1000),
      text: '',
      note: '',
      invoice: null,
      settings: null,
      userId: null,
    }
  }
  set.date = Math.floor(+ new Date() / 1000)
  set.text = text
  set.note = note
  set.invoice = {
    fundedCards: cardIndices,
    amount,
    payment_hash,
    payment_request,
    created: Math.round(+ new Date() / 1000),
    paid: null,
    expired: false,
  }

  // persist data
  try {
    await Promise.all(cardIndices.map(async (index) => {
      const cardHash = hashSha256(`${req.params.setId}/${index}`)
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
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
      })
    }))
    if (insertNewSet) {
      await createSet(set)
    } else {
      await updateSet(set)
    }
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
    data: SetApi.parse(set),
  })
})

const deleteSetRoute = async (req: Request, res: Response, invoiceOnly = false) => {
  // 1. check if set exists
  let set: SetRedis | null = null
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
  if (set == null) {
    res.status(404).json({
      status: 'error',
      message: 'Set not found.',
      code: ErrorCode.SetNotFound,
    })
    return
  }

  // 2. delete set if it has no invoice
  if (set.invoice == null) {
    if (invoiceOnly && set.userId != null) {
      res.json({
        status: 'success',
      })
      return
    }

    try {
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
    return
  }

  // 3. check if invoice is already paid
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
  if (invoiceOnly && set.invoice?.paid != null) {
    res.status(400).json({
      status: 'error',
      message: 'This set invoice is already funded and cannot be deleted anymore!',
      code: ErrorCode.CannotDeleteFundedSet,
    })
    return
  }

  // 4. delete set+cards in database
  try {
    // delete all unfunded cards
    if (invoiceOnly && set.invoice?.paid == null) {
      await Promise.all(set.invoice.fundedCards.map(async (cardIndex) => {
        if (set == null) {
          return
        }
        const cardHash = hashSha256(`${set.id}/${cardIndex}`)
        const cardRedis = await getCardByHash(cardHash)
        if (cardRedis?.setFunding == null) {
          return
        }
        await deleteCard(cardRedis)
      }))
    }

    // delete set or invoice
    if (invoiceOnly && set.userId != null) {
      set.invoice = null
      await updateSet(set)
    } else {
      await deleteSet(set)
    }
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
}

router.delete('/:setId', (req, res) => deleteSetRoute(req, res))
router.delete('/invoice/:setId', (req, res) => deleteSetRoute(req, res, true))

const invoicePaid = async (req: Request, res: Response) => {
  // 1. check if set exists
  let set: SetRedis | null = null
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
      code: ErrorCode.SetNotFound,
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
    data: SetApi.parse(set),
  })
}

router.get('/invoice/paid/:setId', invoicePaid)
router.post('/invoice/paid/:setId', invoicePaid)

export default router
