import z from 'zod'

/**
 * Lifecycle of a card:
 *   - unfunded : nothing happened yet, probably doesn't even exist in the database yet
 *   - funding : an invoice (or at least an lnurlp link) has been created. can even have some sats on it already if shared lnurlp funding
 *   - expired : the invoice (or lnurlp link) expired. the user has to manually reset the card
 *   - funded : the card has sats on it and an lnurlw link was created
 *   - withdrawPending : the user clicked on "receive sats" in his:her lightning wallet (i.e. the invoice was sent from the wallet app to lnbits) but the payment wasn't successfully completed yet
 *   - recentlyWithdrawn : the payment from lnbits to the user wallet was successfully completed not less than 5 mintues ago
 *   - withdrawn : same as above, but longer ago
 *
 * deprecated as this still represents the redis data model
 * @deprecated
 */
export const Card = z.object({
  hash: z.string(),
  created: z.date().default(() => new Date()),
  shared: z.boolean().default(false),
  landingPageViewed: z.date().nullable().default(null),
  textForWithdraw: z.string().default(''),
  noteForStatusPage: z.string().default(''),

  // calculated fields
  lnurl: z.string(),
  invoice: z.object({
    isSet: z.boolean().default(false),
    expired: z.boolean().default(false),
  }).nullable().default(null),
  lnurlp: z.object({
    expired: z.boolean().default(false),
  }).nullable().default(null),
  amount: z.object({
    pending: z.number().nullable().default(null),
    funded: z.number().nullable().default(null),
  }),
  funded: z.date().nullable().default(null),
  isLockedByBulkWithdraw: z.boolean().default(false),
  withdrawPending: z.boolean().default(false).describe('if this is true the user clicked on "receive sats" in the wallet app but the invoice isn\'t paid yet'),
  withdrawn: z.date().nullable().default(null),
})

export type Card = z.infer<typeof Card>

export const CardHash = z.object({
  hash: Card.shape.hash,
})

export type CardHash = z.infer<typeof CardHash>
