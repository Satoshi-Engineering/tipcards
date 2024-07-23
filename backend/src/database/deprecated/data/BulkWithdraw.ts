import z from 'zod'

import { Card } from './Card.js'

export const BulkWithdraw = z.object({
  id: z.string().describe('created via sha256(cardHashes.join())'),
  created: z.number().describe('unix timestamp'),
  amount: z.number(),
  cards: Card.shape.cardHash.array(),
  lnbitsWithdrawId: z.string(),
  lnbitsWithdrawDeleted: z.number().nullable().default(null).describe('unix timestamp'),
  withdrawn: z.number().nullable().default(null).describe('unix timestamp'),
})

export type BulkWithdraw = z.infer<typeof BulkWithdraw>
