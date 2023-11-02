import z from 'zod'

import { Card as CardRedis } from '../redis/Card'

export const Card = CardRedis
  .extend({
    invoice: CardRedis.shape.invoice.removeDefault().unwrap().extend({
      expired: z.boolean().default(false),
    }).nullable().default(null),
    lnurlp: CardRedis.shape.lnurlp.removeDefault().unwrap().extend({
      expired: z.boolean().default(false),
    }).nullable().default(null),
    setFunding: CardRedis.shape.setFunding.removeDefault().unwrap().extend({
      expired: z.boolean().default(false),
    }).nullable().default(null),
    withdrawPending: z.boolean().default(false).describe('if this is true the user clicked on "receive sats" in the wallet app but the invoice isn\'t paid yet'),
  })

export type Card = z.infer<typeof Card>
