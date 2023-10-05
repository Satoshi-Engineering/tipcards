import { z } from 'zod'

export const BulkWithdraw = z.object({
  lnurl: z.string(),
  created: z.date(),
  amount: z.number(),
  numberOfCards: z.number(),
  withdrawPending: z.boolean().default(false), // if this is true the user clicked on "receive sats" in the wallet app but the invoice isn't paid yet
  withdrawn: z.date().optional(),
})
export type BulkWithdraw = z.infer<typeof BulkWithdraw>
