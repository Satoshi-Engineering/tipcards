import { TRPCError } from '@trpc/server'
import axios from 'axios'

import { BulkWithdraw as BulkWithdrawRedis } from '../../../../src/data/redis/BulkWithdraw'

import { getCardByHash, updateCard, createBulkWithdraw } from '../../services/database'
import hashSha256 from '../../services/hashSha256'
import { LNBITS_ORIGIN, LNBITS_ADMIN_KEY, TIPCARDS_API_ORIGIN } from '../../constants'

import { bulkWithdrawFromBulkWithdrawRedis } from '../data/transforms/bulkWithdrawFromBulkWithdrawRedis'
import { Card } from '../data/Card'
import { BulkWithdraw } from '../data/BulkWithdraw'
import {
  router,
  publicProcedure,
} from '../trpc'

// eslint-disable-next-line no-console
console.log('todo : allow the possibility to reset a bulkWithdraw, either directly or from a single card. this should also be possible if the bulkwithdraw was aborted midway, so the user can recover from an error')

export const cardRouter = router({
  bulkWithdraw: publicProcedure
    .input(Card.shape.hash.array())
    .output(BulkWithdraw)
    .mutation(async ({ input }) => {
      // 1. query all cards and check if they all exist
      const cards = await Promise.all(input.map(async (cardHash) => {
        const card = await getCardByHash(cardHash)
        if (card == null) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Card ${cardHash} not found.`,
          })
        }
        return card
      }))

      // 2. for every card check if the card is funded and NOT withdrawn
      const amount = cards.reduce((total, card) => {
        if (card.used) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Card ${card.cardHash} is already withdrawn.`,
          })
        }
        let amountForCard: number | undefined = undefined
        if (card.invoice?.paid != null) {
          amountForCard = card.invoice.amount
        } else if (card.lnurlp?.paid != null && card.lnurlp.amount != null) {
          amountForCard = card.lnurlp.amount
        } else if (card.setFunding?.paid != null) {
          amountForCard = card.setFunding.amount
        }
        if (amountForCard == null) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Card ${card.cardHash} is not funded.`,
          })
        }
        return total + amountForCard
      }, 0)

      // 4. add bulk withdraw id to cards (i.e. flag the card as "bulk withdraw happening")
      await Promise.all(cards.map(async (card) => {
        card.isLockedByBulkWithdraw = true
        await updateCard(card)
      }))

      // 5. set the already existing withdrawIds to 1 sat to prevent double spending race condition (delete vs withdraw)
      // info about deleting withdrawId:
      //  - delete just deletes the lnurl without checking if there are any uses
      //  - I cannot set the uses to 0, min 1 is allowed by the api
      //  - the payment_requests do not contain the withdraw id/link, only the info that they were created by a withdraw
      //  - the "wait_time" property is in seconds and also applies to the first withdraw, so we could use that maybe
      //  - I set the wait time to 100 years for an old withdraw, I could still use it :(
      //  - I could set the max_amount to 1 satoshi, then delete it, if it still has 0 uses (then the user can at most claim 1 satoshi)
      await Promise.all(cards.map(async (card) => {
        if (card.lnbitsWithdrawId == null) {
          return
        }
        const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links`, {
          title: card.text,
          min_withdrawable: 1,
          max_withdrawable: 1,
          uses: 1,
          wait_time: 1,
          is_unique: true,
          webhook_url: `${TIPCARDS_API_ORIGIN}/api/withdraw/used/${card.cardHash}`,
        }, {
          headers: {
            'Content-type': 'application/json',
            'X-Api-Key': LNBITS_ADMIN_KEY,
          },
        })
        if (response.data.used > 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `Card ${card.cardHash} is already used.`,
          })
        }
      }))

      // 6. delete withdrawId from lnbits and database
      await Promise.all(cards.map(async (card) => {
        if (card.lnbitsWithdrawId == null) {
          return
        }
        await axios.delete(`${LNBITS_ORIGIN}/withdraw/api/v1/links/${card.lnbitsWithdrawId}`, {
          headers: {
            'Content-type': 'application/json',
            'X-Api-Key': LNBITS_ADMIN_KEY,
          },
        })
        card.lnbitsWithdrawId = null
        await updateCard(card)
      }))

      // 3. create a bulkwithdraw object id
      const bulkWithdrawId = hashSha256(cards.map((card) => card.cardHash).join(''))

      // 7. create lnurlw in lnbits for the bulkwithdraw and add it to withdraw object
      const response = await axios.post(`${LNBITS_ORIGIN}/withdraw/api/v1/links`, {
        title: `Bulk withdrawing ${cards.length} cards.`,
        min_withdrawable: amount,
        max_withdrawable: amount,
        uses: 1,
        wait_time: 1,
        is_unique: true,
        webhook_url: `${TIPCARDS_API_ORIGIN}/api/bulk-withdraw/withdrawn/${bulkWithdrawId}`,
      }, {
        headers: {
          'Content-type': 'application/json',
          'X-Api-Key': LNBITS_ADMIN_KEY,
        },
      })
      const lnbitsWithdrawId = String(response.data.id)
      const lnbitsWithdrawLnurl = response.data.lnurl

      // 8. save withdraw object in redis
      const bulkWithdraw = BulkWithdrawRedis.parse({
        id: bulkWithdrawId,
        created: new Date(),
        amount,
        cards: input,
        lnbitsWithdrawId,
        lnurl: lnbitsWithdrawLnurl,
        withdrawn: undefined,
      })
      await createBulkWithdraw(bulkWithdraw)

      // 9. return bulkwithdraw
      return await bulkWithdrawFromBulkWithdrawRedis(bulkWithdraw)
    }),
})
