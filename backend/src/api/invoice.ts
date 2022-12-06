import axios from 'axios'
import express from 'express'

import { getCardByHash, createCard, deleteCard } from '../services/database'
import { checkIfCardIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '../services/lnbitsHelpers'
import { TIPCARDS_ORIGIN, TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY } from '../constants'
import type { Card } from '../../../src/data/Card'
import { ErrorCode, ErrorWithCode } from '../../../src/data/Errors'
import { getLandingPageLinkForCardHash } from '../../../src/modules/lnurlHelpers'
import { LNBITS_ORIGIN } from '../../../src/constants'

const router = express.Router()

router.post('/create/:cardHash', async (req: express.Request, res: express.Response) => {
  // amount in sats
  let amount: number | undefined = undefined
  let text = ''
  let note = ''
  try {
    ({ amount, text, note } = req.body)
  } catch (error) {
    console.error(error)
  }
  if (amount == null || amount < 100) {
    res.status(400).json({
      status: 'error',
      message: 'Invalid input.',
    })
    return
  }

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
  if (card?.invoice != null) {
    if (card.invoice.paid) {
      res.status(400).json({
        status: 'error',
        message: 'Card is already funded.',
      })
    } else if (card.invoice.amount === amount) {
      res.json({
        status: 'success',
        data: card.invoice.payment_request,
      })
    } else {
      res.status(400).json({
        status: 'error',
        message: `Card already exists with different amount: ${card.invoice.amount}.`,
      })
    }
    return
  }
  if (card?.lnurlp?.paid != null) {
    res.status(400).json({
      status: 'error',
      message: 'Card is already funded.',
    })
    return
  }

  // create invoice in lnbits
  let payment_hash: string | undefined = undefined
  let payment_request: string | undefined = undefined
  try {
    const response = await axios.post(`${LNBITS_ORIGIN}/api/v1/payments`, {
      out: false,
      amount,
      memo: 'Fund your Lightning Tip Card',
      webhook: `${TIPCARDS_API_ORIGIN}/api/invoice/paid/${req.params.cardHash}`,
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

  // persist data
  try {
    await createCard({
      cardHash: req.params.cardHash,
      text,
      note,
      invoice: {
        amount,
        payment_hash,
        payment_request,
        created: Math.round(+ new Date() / 1000),
        paid: null,
      },
      lnurlp: null,
      lnbitsWithdrawId: null,
      used: null,
    })
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
    data: payment_request,
  })
})

const invoicePaid = async (req: express.Request, res: express.Response) => {
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
  if (card == null) {
    res.status(404).json({
      status: 'error',
      message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }
  if (card.invoice == null) {
    res.status(404).json({
      status: 'error',
      message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
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

  // 3. check if invoice of card is paid and create withdrawId
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
  if (!card.invoice.paid) {
    res.json({
      status: 'success',
      data: 'not_paid',
    })
    return
  }
  res.json({
    status: 'success',
    data: 'paid',
  })
}

router.get('/paid/:cardHash', invoicePaid)
router.post('/paid/:cardHash', invoicePaid)

router.delete('/delete/:cardHash', async (req: express.Request, res: express.Response) => {
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
  if (card == null) {
    res.status(404).json({
      status: 'error',
      message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
    })
    return
  }

  // 2. check if invoice is already paid and used
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
      message: 'Unable to check withdraw status at lnbits.',
      code,
    })
    return
  }
  if (card.lnbitsWithdrawId != null && card.used == null) {
    res.status(400).json({
      status: 'error',
      message: 'This card is funded and not used. Withdraw satoshis first!',
      code: ErrorCode.CardFundedAndNotUsed,
    })
    return
  }
  if (card.lnurlp?.amount != null && card.lnurlp?.amount > 0 && card.used == null) {
    res.status(400).json({
      status: 'error',
      message: 'This card is funded and not used. Withdraw satoshis first!',
      code: ErrorCode.CardFundedAndNotUsed,
    })
    return
  }

  // 4. delete card in database
  try {
    await deleteCard(card)
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

export default router
