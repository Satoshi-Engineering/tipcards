import axios from 'axios'
import { Router, type Request, type Response, type NextFunction } from 'express'

import type { Card } from '@shared/data/api/Card.js'
import { ErrorCode, ErrorWithCode, type ToErrorResponse } from '@shared/data/Errors.js'
import LNURL from '@shared/modules/LNURL/LNURL.js'

import { cardApiFromCardRedis } from '@backend/database/deprecated/transforms/cardApiFromCardRedis.js'
import { getCardByHash } from '@backend/database/deprecated/queries.js'
import ApplicationEventEmitter from '@backend/domain/ApplicationEventEmitter.js'
import CardLockManager from '@backend/domain/CardLockManager.js'
import {
  checkIfCardIsPaidAndCreateWithdrawId,
  checkIfCardIsUsed,
  getLnurlpForNewCard,
  getLnurlpForCard,
  loadCurrentLnurlFromLnbitsByWithdrawId,
  lnurlwCreationHappenedInLastTwoMinutes,
} from '@backend/services/lnbitsHelpers.js'
import { retryGetRequestWithDelayUntilSuccessWithMaxAttempts } from '@backend/services/axiosUtils.js'
import { TIPCARDS_API_ORIGIN, VOLT_VAULT_ORIGIN } from '@backend/constants.js'

import { emitCardUpdateForSingleCard } from './middleware/emitCardUpdates.js'
import { lockCardMiddleware, releaseCardMiddleware } from './middleware/handleCardLock.js'
import { calculateFeeForCard } from '@shared/modules/feeCalculation.js'

export default (
  applicationEventEmitter: ApplicationEventEmitter,
  cardLockManager: CardLockManager,
) => {
  const router = Router()

  const toErrorResponse: ToErrorResponse = ({ message, code }) => ({
    status: 'ERROR',
    reason: message,
    code,
  })

  /**
   * lnurlw withdraw endpoint
   *
   * this endpoint is used to validate the estimated fee for payout.
   * return an error, if it is more than 1 % (our fee we take during funding).
   */
  router.get('/withdraw', async (req, res) => {
    const callback = String(req.query.callback)
    const k1 = String(req.query.k1)
    const pr = String(req.query.pr)

    // get the estimates fees
    let totalFee: number | null = null
    let amount: number | null = null
    try {
      const url = `${VOLT_VAULT_ORIGIN}/api/lnd/query-routes`
      const response = await axios.get(`${url}?paymentRequestEncoded=${pr}`)
      response.data.queryRoutesResponse.routes.forEach((route: { total_fees: string }) => {
        const routeFee = Number(route.total_fees)
        if (totalFee == null || routeFee < totalFee) {
          totalFee = routeFee
        }
      })
      amount = Number(response.data.paymentRequestDecoded.num_satoshis)
    } catch (error) {
      const errorMessage = 'Unable to calculate estimated fee.'
      res.status(503).json(toErrorResponse({
        message: errorMessage,
        code: ErrorCode.UnableToFindValidRoute,
      }))
      throw new ErrorWithCode(error, ErrorCode.UnableToFindValidRoute)
    }

    if (totalFee == null) {
      res.status(400).json(toErrorResponse({
        message: 'No route found.',
      }))
      return
    }

    // check if the fee is too high
    const maxAllowedFee = calculateFeeForCard(amount)
    if (totalFee > maxAllowedFee) {
      res.status(400).json(toErrorResponse({
        message: 'Unable to find valid route. Estimated fees too high.',
        code: ErrorCode.UnableToFindValidRoute,
      }))
      return
    }

    // send the invoice to lnbits for payout
    try {
      const response = await axios.get(`${decodeURIComponent(callback)}&k1=${k1}&pr=${pr}`)
      res.json(response.data)
    } catch {
      res.status(500).json(toErrorResponse({
        message: 'Unable to resolve LNURL at lnbits.',
        code: ErrorCode.UnableToResolveLnbitsLnurl,
      }))
    }
  })

  const routeHandler = async (req: Request, res: Response, next: NextFunction) => {
    const cardHash = req.params.cardHash

    let card: Card | null = null

    // load card from database
    try {
      const cardRedis = await getCardByHash(cardHash)
      if (cardRedis != null) {
        card = cardApiFromCardRedis(cardRedis)
      }
    } catch (error: unknown) {
      console.error(ErrorCode.UnknownDatabaseError, error)
      res.status(500).json(toErrorResponse({
        message: 'Unknown database error.',
        code: ErrorCode.UnknownDatabaseError,
      }))
      next()
      return
    }

    // create + return lnurlp for unfunded card
    if (card == null) {
      try {
        const data = await getLnurlpForNewCard(cardHash)
        res.json(data)
      } catch (error) {
        console.error(ErrorCode.UnableToCreateLnurlP, error)
        res.status(500).json(toErrorResponse({
          message: 'Unable to create LNURL-P at lnbits.',
          code: ErrorCode.UnableToCreateLnurlP,
        }))
      }
      next()
      return
    }

    // check if card is locked by bulkWithdraw
    if (card.isLockedByBulkWithdraw) {
      res.status(400).json(toErrorResponse({
        message: 'A recall of this TipCard is currently in progress. You have to cancel it first to use the card.',
        code: ErrorCode.CardIsLockedByBulkWithdraw,
      }))
      next()
      return
    }

    // check if invoice is already paid and get withdrawId
    if (card.lnbitsWithdrawId == null) {
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
    }

    // create + return lnurlp for unfunded card
    if (card.lnbitsWithdrawId == null) {
      if (card.invoice != null) {
        res.status(400).json(toErrorResponse({
          message: 'This card has an invoice. Pay or reset the invoice first in your browser.',
          code: ErrorCode.CannotCreateLnurlPCardHasInvoice,
        }))
        next()
        return
      }

      if (card.setFunding != null) {
        res.status(400).json(toErrorResponse({
          message: 'This card is being funded via set funding.',
          code: ErrorCode.CardNeedsSetFunding,
        }))
        next()
        return
      }

      try {
        const data = await getLnurlpForCard(card)
        res.json(data)
      } catch (error) {
        console.error(ErrorCode.UnableToCreateLnurlP, error)
        res.status(500).json(toErrorResponse({
          message: 'Unable to create LNURL-P at lnbits.',
          code: ErrorCode.UnableToCreateLnurlP,
        }))
      }
      next()
      return
    }

    // check if card is already used
    if (card.used == null) {
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
        next()
        return
      }
    }
    if (card.used != null) {
      res.status(400).json(toErrorResponse({
        message: 'Card has already been used.',
        code: ErrorCode.WithdrawHasBeenSpent,
      }))
      next()
      return
    }

    // check if card withdraw is pending
    if (card.withdrawPending) {
      if (!(await lnurlwCreationHappenedInLastTwoMinutes(card.lnbitsWithdrawId))) {
        console.error(`Card ${card.cardHash} withdraw is pending for more than 2 minutes and user tried again.`)
      }
      res.status(400).json(toErrorResponse({
        message: 'Card has already been used, but the payment is still pending.',
        code: ErrorCode.WithdrawIsPending,
      }))
      next()
      return
    }

    let lnurl = null
    try {
      lnurl = await loadCurrentLnurlFromLnbitsByWithdrawId(card.lnbitsWithdrawId)
    } catch (error) {
      console.error(ErrorCode.UnableToGetLnurl, error)
      res.status(500).json(toErrorResponse({
        message: 'Unable to get LNURL from lnbits.',
        code: ErrorCode.UnableToGetLnurl,
      }))
      next()
      return
    }

    if (lnurl == null) {
      res.status(404).json(toErrorResponse({
        message: 'WithdrawId not found at lnbits.',
        code: ErrorCode.CardByHashNotFound,
      }))
      next()
      return
    }

    try {
      const response = await retryGetRequestWithDelayUntilSuccessWithMaxAttempts(LNURL.decode(lnurl))
      if (
        VOLT_VAULT_ORIGIN != null
        && response.data.tag === 'withdrawRequest'
      ) {
        const callback = `${TIPCARDS_API_ORIGIN}/api/lnurl/withdraw?callback=${encodeURIComponent(response.data.callback)}`
        res.json({
          ...response.data,
          callback,
        })
      } else {
        res.json(response.data)
      }
    } catch (error) {
      console.error(
        `Unable to resolve lnurlw at lnbits for card ${card.cardHash}`,
        error,
      )
      res.status(500).json(toErrorResponse({
        message: 'Unable to resolve LNURL at lnbits.',
        code: ErrorCode.UnableToResolveLnbitsLnurl,
      }))
    }
    next()
  }

  /**
   * LNURL response when cards are scanned directly
   */
  router.get(
    '/:cardHash',
    lockCardMiddleware(toErrorResponse, cardLockManager),
    routeHandler,
    releaseCardMiddleware,
    emitCardUpdateForSingleCard(applicationEventEmitter),
  )

  return router
}
