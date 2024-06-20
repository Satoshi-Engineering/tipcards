import { BulkWithdrawId } from '@shared/data/trpc/BulkWithdraw'
import { CardHash } from '@shared/data/trpc/Card'

import {
  lockCard, safeReleaseCard,
  lockCards, safeReleaseCards,
} from '@backend/services/databaseCardLock'
import BulkWithdrawModule from '@backend/modules/BulkWithdraw'

import { publicProcedure } from '../../trpc'

export const handleCardLockForSingleCard = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const lockValue = await lockCard(input.hash)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCard(input.hash, lockValue)
    }
  })

export const handleCardLockForMultipleCards = publicProcedure
  .input(CardHash.shape.hash.array())
  .use(async ({ input, next }) => {
    const lockValues = await lockCards(input)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })

export const handleCardLockForBulkWithdraw = publicProcedure
  .input(BulkWithdrawId)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawModule.fromId(input.id)
    const lockValues = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })

export const handleCardLockForBulkWithdrawByCardHash = publicProcedure
  .input(CardHash)
  .use(async ({ input, next }) => {
    const bulkWithdraw = await BulkWithdrawModule.fromCardHash(input.hash)
    const lockValues = await lockCards(bulkWithdraw.cards.cardHashes)
    try {
      const result = await next()
      return result
    } finally {
      safeReleaseCards(lockValues)
    }
  })
