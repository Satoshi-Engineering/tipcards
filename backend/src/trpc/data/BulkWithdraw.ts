import { z } from 'zod'

import { Card } from './Card'

export const BulkWithdraw = z.object({
  id: z.string(),
  lnurl: z.string(),
  created: z.date(),
  amount: z.number(),
  cards: Card.shape.hash.array(),
  withdrawPending: z.boolean().default(false).describe('if this is true the user clicked on "receive sats" in the wallet app but the invoice isn\'t paid yet'),
  withdrawn: z.date().nullable().default(null),
})

export type BulkWithdraw = z.infer<typeof BulkWithdraw>
