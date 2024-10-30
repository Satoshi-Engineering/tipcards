import { BulkWithdrawId } from '@shared/data/trpc/BulkWithdraw.js'
import { CardHash } from '@shared/data/trpc/Card.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'

import { cardUpdateEvent } from '@backend/domain/ApplicationEventEmitter.js'
import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

import { publicProcedure } from '../../trpc.js'

export const emitCardUpdateForSingleCard = publicProcedure
  .input(CardHash)
  .use(async ({ ctx, input, next }) => {
    try {
      const result = await next()
      return result
    } finally {
      ctx.applicationEventEmitter.emit(cardUpdateEvent(input.hash))
    }
  })

export const emitCardUpdatesForMultipleCards = publicProcedure
  .input(CardHash.shape.hash.array())
  .use(async ({ ctx, input, next }) => {
    try {
      const result = await next()
      return result
    } finally {
      input.forEach((cardHash) => {
        ctx.applicationEventEmitter.emit(cardUpdateEvent(cardHash))
      })
    }
  })

export const emitCardUpdatesForBulkWithdraw = publicProcedure
  .input(BulkWithdrawId)
  .use(async ({ ctx, input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(input.id)
    try {
      const result = await next()
      return result
    } finally {
      bulkWithdraw.cards.cardHashes.forEach((cardHash) => {
        ctx.applicationEventEmitter.emit(cardUpdateEvent(cardHash))
      })
    }
  })

export const emitCardUpdatesForBulkWithdrawByCardHash = publicProcedure
  .input(CardHash)
  .use(async ({ ctx, input, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromCardHash(input.hash)
    try {
      const result = await next()
      return result
    } finally {
      bulkWithdraw.cards.cardHashes.forEach((cardHash) => {
        ctx.applicationEventEmitter.emit(cardUpdateEvent(cardHash))
      })
    }
  })

export const emitCardUpdatesForSet = publicProcedure
  .input(SetDeprecatedId)
  .use(async ({ ctx, input, next }) => {
    const cards = await CardCollectionDeprecated.fromSetId(input.id)
    try {
      const result = await next()
      return result
    } finally {
      cards.cardHashes.forEach((cardHash) => {
        ctx.applicationEventEmitter.emit(cardUpdateEvent(cardHash))
      })
    }
  })
