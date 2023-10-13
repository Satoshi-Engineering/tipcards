import { TRPCError } from '@trpc/server'
import axios from 'axios'
import z from 'zod'

import { BulkWithdraw as ZodBulkWithdrawRedis, type BulkWithdraw as BulkWithdrawRedis } from '../../../../src/data/redis/BulkWithdraw'

import CardCollection from '../../modules/CardCollection'
import BulkWithdraw from '../../modules/BulkWithdraw'
import {
  getCardByHash, updateCard,
  getBulkWithdrawById, deleteBulkWithdraw as deleteBulkWithdrawRedis,
  getAllBulkWithdraws,
} from '../../services/database'
import { LNBITS_ORIGIN, LNBITS_ADMIN_KEY, TIPCARDS_API_ORIGIN } from '../../constants'

import { cardFromCardRedis } from '../data/transforms/cardFromCardRedis'
import { Card } from '../data/Card'
import { BulkWithdraw as BulkWithdrawTrpc } from '../data/BulkWithdraw'
import {
  router,
  publicProcedure,
} from '../trpc'

// eslint-disable-next-line no-console
console.log('todo : clean u this file, should only contain the procedures, which should be handful of lines max')

export const bulkWithdrawRouter = router({
  createForCards: publicProcedure
    .input(Card.shape.hash.array())
    .output(BulkWithdrawTrpc)
    .mutation(async ({ input }) => {
      const cards = await CardCollection.fromCardHashes(input)
      const bulkWithdraw = BulkWithdraw.fromCardCollection(cards)
      await bulkWithdraw.create()
      return bulkWithdraw.toTRpcResponse()
    }),

  deleteById: publicProcedure
    .input(ZodBulkWithdrawRedis.shape.id)
    .output(Card.shape.hash.array())
    .mutation(async ({ input }) => {
      const bulkWithdraw = await getBulkWithdrawById(input)
      await deleteBulkWithdraw(bulkWithdraw)
      return bulkWithdraw.cards
    }),

  deleteByCardHash: publicProcedure
    .input(Card.shape.hash)
    .output(Card)
    .mutation(async ({ input }) => {
      // 1. query the card
      const card = await getCardByHash(input)
      if (card == null) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Card not found.',
        })
      }

      // 2. find the bulkWithdraw
      const bulkWithdraws = await getAllBulkWithdraws()
      const bulkWithdraw = bulkWithdraws.find((current) => current.cards.includes(input))

      // 3. call the bulkWithdraw delete procedure
      if (bulkWithdraw != null) {
        await deleteBulkWithdraw(bulkWithdraw)
      } else {
        card.isLockedByBulkWithdraw = false
        await updateCard(card)
      }

      // 4. release card
      return await cardFromCardRedis(card)
    }),
})

const deleteBulkWithdraw = async (bulkWithdraw: BulkWithdrawRedis) => {
  // 1. check if withdrawn already
  if (bulkWithdraw.withdrawn != null) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `BulkWithdraw ${bulkWithdraw.id} is already withdrawn.`,
    })
  }

  // 2. set withdraw in lnbits to 1 sat max
  const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links/${bulkWithdraw.lnbitsWithdrawId}`, {
    title: `Bulk withdrawing ${bulkWithdraw.cards.length} cards.`,
    min_withdrawable: 1,
    max_withdrawable: 1,
    uses: 1,
    wait_time: 1,
    is_unique: true,
    webhook_url: `${TIPCARDS_API_ORIGIN}/api/bulk-withdraw/withdrawn/${bulkWithdraw.id}`,
  }, {
    headers: {
      'Content-type': 'application/json',
      'X-Api-Key': LNBITS_ADMIN_KEY,
    },
  })
  const used = z.object({ used: z.number() }).transform(({ used }) => used).parse(response.data)
  if (used > 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `BulkWithdraw ${bulkWithdraw.id} is already withdrawn.`,
    })
  }

  // 3. delete the withdraw in lnbits
  await axios.delete(`${LNBITS_ORIGIN}/withdraw/api/v1/links/${bulkWithdraw.lnbitsWithdrawId}`, {
    headers: {
      'Content-type': 'application/json',
      'X-Api-Key': LNBITS_ADMIN_KEY,
    },
  })

  // 4. release all locked cards for this bulk withdraw
  await Promise.all(bulkWithdraw.cards.map(async (cardHash) => {
    const card = await getCardByHash(cardHash)
    if (card?.lnbitsWithdrawId == null) {
      return
    }
    card.isLockedByBulkWithdraw = false
    await updateCard(card)
  }))

  // 5. delete bulk withdraw in database
  await deleteBulkWithdrawRedis(bulkWithdraw)
}
