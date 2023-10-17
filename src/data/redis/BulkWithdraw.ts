import z from 'zod'

import { Card } from './Card'

export const BulkWithdraw = z.object({
  id: z.string().describe('created via sha256(cardHashes.join())'),
  created: z.date(),
  amount: z.number(),
  cards: Card.shape.cardHash.array(),
  lnbitsWithdrawId: z.string().nullable().default(null),
  lnurl: z.string(),
  withdrawn: z.date().nullable().default(null),
})

export type BulkWithdraw = z.infer<typeof BulkWithdraw>
