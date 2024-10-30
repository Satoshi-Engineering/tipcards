import { type NextFunction, Router, type Request, type Response } from 'express'

import type { Card } from '@shared/data/api/Card.js'
import { ErrorCode, ErrorWithCode, type ToErrorResponse } from '@shared/data/Errors.js'
import { getLandingPageLinkForCardHash } from '@shared/modules/cardUrlHelpers.js'

import { cardApiFromCardRedis } from '@backend/database/deprecated/transforms/cardApiFromCardRedis.js'
import { cardRedisFromCardApi } from '@backend/database/deprecated/transforms/cardRedisFromCardApi.js'
import { createCard, getCardByHash, updateCard } from '@backend/database/deprecated/queries.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import {
  getLnurlpForCard,
  checkIfCardLnurlpIsPaid,
  checkIfCardIsPaidAndCreateWithdrawId,
} from '@backend/services/lnbitsHelpers.js'
import { TIPCARDS_ORIGIN } from '@backend/constants.js'

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

  /**
   * Create shared funding lnurlp link
   */
  router.post('/create/:cardHash', async (req, res) => {
    let text = ''
    let note = ''
    try {
      ({ text, note } = req.body)
    } catch (error) {
      console.error(error)
    }

    // check if card/invoice already exists
    let card: Card | null = null
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

    // create new card if it doesn't exist yet
    if (card == null) {
      card = {
        cardHash: req.params.cardHash,
        text,
        note,
        invoice: null,
        lnurlp: null,
        setFunding: null,
        lnbitsWithdrawId: null,
        landingPageViewed: null,
        isLockedByBulkWithdraw: false,
        used: null,
        withdrawPending: false,
      }
      try {
        await createCard(cardRedisFromCardApi(card))
      } catch (error) {
        console.error(ErrorCode.UnknownDatabaseError, error)
        res.status(500).json(toErrorResponse({
          message: 'An unexpected error occured. Please try again later or contact an admin.',
          code: ErrorCode.UnknownDatabaseError,
        }))
        return
      }
    }

    // check status of card
    if (card.invoice != null) {
      if (card.invoice.paid != null) {
        res.status(400).json(toErrorResponse({
          message: 'Card is already funded.',
        }))
      } else {
        res.status(400).json(toErrorResponse({
          message: 'Card already has an invoice.',
        }))
      }
      return
    }
    if (card.lnurlp?.paid != null) {
      res.status(400).json(toErrorResponse({
        message: 'Card is already funded.',
      }))
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to create LNURL-P at lnbits.',
      }))
    }
  })

  /**
   * Handle lnurlp link payment. Either single or shared funding.
   */
  const cardPaid = async (req: Request, res: Response, next: NextFunction) => {
    // 1. check if card exists
    let card: Card | null = null
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
    if (card?.lnurlp == null) {
      res.status(404).json(toErrorResponse({
        message: `Card not found. Go to ${getLandingPageLinkForCardHash(TIPCARDS_ORIGIN, req.params.cardHash)} to fund it.`,
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
      res.status(500).json(toErrorResponse({
        message: 'Unable to check invoice status at lnbits.',
        code,
      }))
      next()
      return
    }
    if (card.invoice?.paid || card.lnurlp?.paid) {
      res.json({
        status: 'success',
        data: 'paid',
      })
      next()
      return
    }
    res.json({
      status: 'success',
      data: 'not_paid',
    })
    next()
  }
  router.get(
    '/paid/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardPaid,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )
  router.post(
    '/paid/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardPaid,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  /**
   * Update text+note for shared cards
   */
  const cardUpdate = async (req: Request, res: Response, next: NextFunction) => {
    // check if card exists
    let card: Card | null = null
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
        message: 'Card not found.',
      }))
      next()
      return
    }
    if (card.isLockedByBulkWithdraw) {
      res.status(400).json(toErrorResponse({
        message: 'This TipCard is locked by bulk withdraw.',
      }))
      next()
      return
    }
    if (card.lnurlp == null) {
      res.status(400).json(toErrorResponse({
        message: 'This TipCard has no lnurlp enabled.',
      }))
      next()
      return
    }
    if (card.lnurlp.paid) {
      res.status(400).json(toErrorResponse({
        message: 'This TipCard is already funded.',
      }))
      next()
      return
    }

    // update text + note
    let text = ''
    let note = ''
    try {
      ({ text, note } = req.body)
    } catch (error) {
      console.error(error)
    }
    card.text = text
    card.note = note

    try {
      await updateCard(card)
    } catch (error) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'Unable to update card.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      next()
      return
    }
    res.json({
      status: 'success',
      data: card,
    })
    next()
  }
  router.post(
    '/update/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardUpdate,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  /**
   * Finish shared funding lnurlp link
   */
  const cardFinish = async (req: Request, res: Response, next: NextFunction) => {
    // check if card exists
    let card: Card | null = null
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
        message: 'Card not found.',
      }))
      next()
      return
    }
    if (!card.lnurlp?.shared) {
      res.status(400).json(toErrorResponse({
        message: 'This TipCard has no shared funding enabled.',
      }))
      next()
      return
    }

    // update text + note
    let text = ''
    let note = ''
    try {
      ({ text, note } = req.body)
    } catch (error) {
      console.error(error)
    }
    card.text = text
    card.note = note

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
      res.status(500).json(toErrorResponse({
        message: 'Unable to check invoice status at lnbits.',
        code,
      }))
      next()
      return
    }
    if (!card.lnurlp.paid) {
      res.status(400).json(toErrorResponse({
        message: 'Card is not paid.',
      }))
      next()
      return
    }

    res.json({
      status: 'success',
      data: card,
    })
    next()
  }
  router.post(
    '/finish/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    cardFinish,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  return router
}
