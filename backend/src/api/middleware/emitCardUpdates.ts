import type { Request, Response, NextFunction } from 'express'

import ApplicationEventEmitter, { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'

export const emitCardUpdateForSingleCard = (applicationEventEmitter: ApplicationEventEmitter) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const cardHash = req.params.cardHash
    if (!cardHash) {
      console.error('emitCardUpdateForSingleCard called without cardHash', req)
      return
    }

    applicationEventEmitter.emit(cardUpdateEvent(cardHash))

    next()
  }

export const emitCardUpdatesForBulkWithdraw = (applicationEventEmitter: ApplicationEventEmitter) =>
  async (req: Request, _: Response, next: NextFunction) => {
    const bulkWithdrawId = req.params.bulkWithdrawId
    if (!bulkWithdrawId) {
      console.error('emitCardUpdatesForBulkWithdraw called without bulkWithdrawId', req)
      return
    }

    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(bulkWithdrawId)
    bulkWithdraw.cards.cardHashes.forEach((cardHash) => {
      applicationEventEmitter.emit(cardUpdateEvent(cardHash))
    })

    next()
  }
