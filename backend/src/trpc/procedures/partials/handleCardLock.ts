import { BulkWithdrawId } from '@shared/data/trpc/BulkWithdraw.js'
import { CardHash } from '@shared/data/trpc/Card.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'

import BulkWithdrawDeprecated from '@backend/domain/BulkWithdrawDeprecated.js'
import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'
import Lock from '@backend/services/locking/Lock.js'

import { publicProcedure } from '../../trpc.js'

export const handleCardLockForSingleCard = publicProcedure
  .input(CardHash)
  .use(async ({ input, ctx, next }) => {
    const lock = await ctx.cardLockManager.lockCard(input.hash)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseLocks(lock)
    }
  })

export const handleCardLockForMultipleCards = publicProcedure
  .input(CardHash.shape.hash.array())
  .use(async ({ input, ctx, next }) => {
    const locks = await ctx.cardLockManager.lockCards(input)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseLocks(locks)
    }
  })

export const handleCardLockForBulkWithdraw = publicProcedure
  .input(BulkWithdrawId)
  .use(async ({ input, ctx, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromId(input.id)
    const locks = await ctx.cardLockManager.lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseLocks(locks)
    }
  })

export const handleCardLockForBulkWithdrawByCardHash = publicProcedure
  .input(CardHash)
  .use(async ({ input, ctx, next }) => {
    const bulkWithdraw = await BulkWithdrawDeprecated.fromCardHash(input.hash)
    const locks = await ctx.cardLockManager.lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseLocks(locks)
    }
  })

export const handleCardLockForSet = publicProcedure
  .input(SetDeprecatedId)
  .use(async ({ input, ctx, next }) => {
    const cards = await CardCollectionDeprecated.fromSetId(input.id)
    const locks = await ctx.cardLockManager.lockCards(cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseLocks(locks)
    }
  })

const safeReleaseLocks = (locks: Lock | Lock[]) => {
  const locksArray = Array.isArray(locks) ? locks : [locks]
  locksArray.forEach(lock => {
    try {
      lock.release()
    } catch (error) {
      console.error(`Error releasing card lock for card ${lock.resourceId} with lock (id:${lock.id}, resourceId:${lock.resourceId}`, error)
    }
  })
}
