import { Card } from '@shared/data/trpc/Card.js'
import { SetDto } from '@shared/data/trpc/SetDto.js'
import { CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'
import { SetDeprecatedId } from '@shared/data/trpc/Set.js'
import { CardStatusDto } from '@shared/data/trpc/CardStatusDto.js'

import Set from '@backend/domain/Set.js'
import SetCollection from '@backend/domain/SetCollection.js'

import CardCollectionDeprecated from '@backend/domain/CardCollectionDeprecated.js'

import { router } from '../../trpc.js'
import publicProcedure from '../../procedures/public.js'
import loggedInProcedure from '../../procedures/loggedIn.js'
import { handleCardLockForSet } from '../../procedures/partials/handleCardLock.js'

export const setRouter = router({
  getAll: loggedInProcedure
    .output(SetDto.array())
    .query(async ({ ctx }) => {
      const setCollection = await SetCollection.fromUserId(ctx.loggedInUser.id)
      return setCollection.toTRpcResponse()
    }),

  getById: loggedInProcedure
    .input(SetDto.shape.id)
    .output(SetDto)
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      return set.toTRpcResponse()
    }),

  getCardsSummaryForSetId: loggedInProcedure
    .input(SetDto.shape.id)
    .output(CardsSummaryDto)
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      const cardStatusCollection = await set.getCardStatusCollection()
      return cardStatusCollection.summary.toTRpcResponse()
    }),

  // SetDto contains the set's id and the numberOfCards,
  // which are needed to calculate the card hashes
  getCardsSummaryForSetDto: publicProcedure
    .input(SetDto)
    .output(CardsSummaryDto)
    .query(async ({ input }) => {
      const set = Set.fromSetDto(input)
      const cardStatusCollection = await set.getCardStatusCollection()
      return cardStatusCollection.summary.toTRpcResponse()
    }),

  getCardStatusesForSetId: loggedInProcedure
    .input(SetDto.shape.id)
    .output(CardStatusDto.array())
    .query(async ({ input }) => {
      const set = await Set.fromId(input)
      const cardStatusCollection = await set.getCardStatusCollection()
      return cardStatusCollection.toTrpcResponse().data
    }),

  getCardsDeprecated: publicProcedure
    .input(SetDeprecatedId)
    .output(Card.array())
    .unstable_concat(handleCardLockForSet)
    .query(async ({ input }) => {
      const cards = await CardCollectionDeprecated.fromSetId(input.id)
      return await cards.toTRpcResponse()
    }),
})
