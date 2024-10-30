import axios from 'axios'
import { Router, type Request, type Response, type NextFunction } from 'express'

import type { Card as CardApi } from '@shared/data/api/Card.js'
import { ErrorCode, ErrorWithCode, type ToErrorResponse } from '@shared/data/Errors.js'
import { getLandingPageLinkForCardHash } from '@shared/modules/cardUrlHelpers.js'

import { cardApiFromCardRedis } from '@backend/database/deprecated/transforms/cardApiFromCardRedis.js'
import { cardRedisFromCardApi } from '@backend/database/deprecated/transforms/cardRedisFromCardApi.js'
import { getCardByHash, createCard, deleteCard } from '@backend/database/deprecated/queries.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import { checkIfCardIsPaidAndCreateWithdrawId, checkIfCardIsUsed } from '@backend/services/lnbitsHelpers.js'
import { TIPCARDS_ORIGIN, TIPCARDS_API_ORIGIN, LNBITS_INVOICE_READ_KEY, LNBITS_ORIGIN } from '@backend/constants.js'

import { emitCardUpdateForSingleCard } from './middleware/emitCardUpdates.js'
import { lockCardMiddleware, releaseCardMiddleware } from './middleware/handleCardLock.js'

export default (
  applicationEventEmitter: ApplicationEventEmitter,
  cardLockManager: CardLockManager,
) => {
  const router = Router()

  const toErrorResponse: ToErrorResponse = ({ message, code }) => ({
    status: 'error',
    message,
    code,
  })

  router.post('/create/:cardHash', async (req, res) => {
    // amount in sats
    let amount: number | undefined = undefined
    let text = ''
    let note = ''
    try {
      amount = req.body.amount
      text = req.body.text || ''
      note = req.body.note || ''
    } catch (error) {
      console.error(error)
    }
    if (amount == null || amount < 200 || amount > 2200000) {
      res.status(400).json(toErrorResponse({
        message: 'Invalid amount, has to be between 210 and 2,100,000 sats.',
      }))
      return
    }

    // check if card/invoice already exists
    let card: CardApi | null = null
    try {
      const cardRedis = await getCardByHash(req.params.cardHash)
      if (cardRedis != null) {
        card = cardApiFromCardRedis(cardRedis)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      return
    }
    if (card?.invoice != null) {
      if (card.invoice.paid) {
        res.status(400).json(toErrorResponse({
          message: 'Card is already funded.',
        }))
      } else if (card.invoice.amount === amount) {
        res.json({
          status: 'success',
          data: card.invoice.payment_request,
        })
      } else {
        res.status(400).json(toErrorResponse({
          message: `Card already exists with different amount: ${card.invoice.amount}.`,
        }))
      }
      return
    }
    if (card?.lnurlp?.paid != null) {
      res.status(400).json(toErrorResponse({
        message: 'Card is already funded.',
      }))
      return
    }

    // create invoice in lnbits
    let payment_hash: string | undefined = undefined
    let payment_request: string | undefined = undefined
    try {
      const response = await axios.post(`${LNBITS_ORIGIN}/api/v1/payments`, {
        out: false,
        amount,
        memo: 'Fund your Lightning TipCard',
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to create invoice at lnbits.',
        code: ErrorCode.UnableToCreateLnbitsInvoice,
      }))
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
        setFunding: null,
        lnbitsWithdrawId: null,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
      })
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      return
    }
    res.json({
      status: 'success',
      data: payment_request,
    })
  })

  const invoicePaid = async (req: Request, res: Response, next: NextFunction) => {
    // 1. check if card exists
    let card: CardApi | null = null
    try {
      const cardRedis = await getCardByHash(req.params.cardHash)
      if (cardRedis != null) {
        card = cardApiFromCardRedis(cardRedis)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      next()
      return
    }
    if (card == null) {
      res.status(404).json(toErrorResponse({
        message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      }))
      next()
      return
    }
    if (card.invoice == null) {
      res.status(404).json(toErrorResponse({
        message: `Card has no funding invoice. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      }))
      next()
      return
    }

    // 2. check if card already has withdrawId
    if (card.lnbitsWithdrawId != null) {
      res.json({
        status: 'success',
        data: 'paid',
      })
      next()
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to check invoice status at lnbits.',
        code,
      }))
      next()
      return
    }
    if (!card.invoice.paid) {
      res.json({
        status: 'success',
        data: 'not_paid',
      })
      next()
      return
    }
    res.json({
      status: 'success',
      data: 'paid',
    })
    next()
  }
  router.get(
    '/paid/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    invoicePaid,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )
  router.post(
    '/paid/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    invoicePaid,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  router.delete('/delete/:cardHash', async (req, res) => {
    // 1. check if card exists
    let card: CardApi | null = null
    try {
      const cardRedis = await getCardByHash(req.params.cardHash)
      if (cardRedis != null) {
        card = cardApiFromCardRedis(cardRedis)
      }
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      return
    }
    if (card == null) {
      res.status(404).json(toErrorResponse({
        message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
      }))
      return
    }

    // 2. check if card is locked
    if (card.isLockedByBulkWithdraw) {
      res.status(400).json(toErrorResponse({
        message: 'This card is locked by bulk withdraw!',
      }))
      return
    }

    // 3. check if invoice is already paid and used
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to check invoice status at lnbits.',
        code,
      }))
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to check withdraw status at lnbits.',
        code,
      }))
      return
    }
    if (card.lnbitsWithdrawId != null && card.used == null) {
      res.status(400).json(toErrorResponse({
        message: 'This card is funded and not used. Withdraw satoshis first!',
      }))
      return
    }
    if (card.lnurlp?.amount != null && card.lnurlp?.amount > 0 && card.used == null) {
      res.status(400).json(toErrorResponse({
        message: 'This card is funded and not used. Withdraw satoshis first!',
        code: ErrorCode.CardFundedAndNotUsed,
      }))
      return
    }

    // 4. delete card in database
    try {
      await deleteCard(cardRedisFromCardApi(card))
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'An unexpected error occured. Please try again later or contact an admin.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      return
    }
    res.json({
      status: 'success',
    })
  })

  return router
}
