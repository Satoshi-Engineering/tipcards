import z from 'zod'

import { Card as CardRedis } from '../redis/Card'

export const Card = CardRedis.extend({
  withdrawPending: z.boolean().optional(), // if this is true the user clicked on "receive sats" in the wallet app but the invoice isn't paid yet
})

export type Card = z.infer<typeof Card>
