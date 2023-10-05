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
 * todo : make a helper function for every state (e.g. isUnfunded)
 */
export const Card = z.object({
  hash: z.string(),
  created: z.date().default(() => new Date()),
  shared: z.boolean().default(false),
  landingPageViewed: z.date().optional(),
  textForWithdraw: z.string().optional(),
  noteForStatusPage: z.string().optional(),

  // calculated fields
  lnurl: z.string(),
  invoice: z.object({
    isSet: z.boolean().default(false),
    expired: z.date().optional(),
  }).optional(),
  lnurlp: z.object({
    expired: z.date().optional(),
  }).optional(),
  amount: z.object({
    pending: z.number().optional(),
    funded: z.number().optional(),
  }),
  funded: z.date().optional(),
  isBulkWithdraw: z.boolean().default(false),
  withdrawPending: z.boolean().default(false), // if this is true the user clicked on "receive sats" in the wallet app but the invoice isn't paid yet
  withdrawn: z.date().optional(),
})
export type Card = z.infer<typeof Card>
