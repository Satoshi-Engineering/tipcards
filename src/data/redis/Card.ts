import z from 'zod'

export const Card = z.object({
  cardHash: z.string().describe('created via sha256(`${cardSetUuid}/${cardSetIndex}`)'),
  text: z.string().default('').describe('shown in lightning app when withdrawing'),
  note: z.string().default('').describe('shown on status page of card (info for person who funded the card)'),
  invoice: z.object({
    amount: z.number(),
    payment_hash: z.string(),
    payment_request: z.string(),
    created: z.number().describe('unix timestamp'),
    paid: z.number().nullable().describe('unix timestamp'),
  }).nullable().default(null),
  lnurlp: z.object({
    shared: z.boolean().default(false),
    amount: z.number().nullable(),
    payment_hash: z.string().array().nullable(),
    id: z.union([z.number(), z.string()]),
    created: z.number().describe('unix timestamp'),
    paid: z.number().nullable().describe('unix timestamp'),
  }).nullable().default(null).describe('gets created if the user scans an unfunded card with a wallet'),
  setFunding: z.object({
    amount: z.number(),
    created: z.number().describe('unix timestamp'),
    paid: z.number().nullable().describe('unix timestamp'),
  }).nullable().default(null).describe('card is funded via set-funding'),
  lnbitsWithdrawId: z.string().nullable().default(null).describe('gets set as soon as the card is funded'),
  landingPageViewed: z.number().nullable().default(null).describe('store the first time the landing page was viewed after it has been funded'),
  isLockedByBulkWithdraw: z.boolean().default(false),
  used: z.number().nullable().default(null).describe('unix timestamp'),
})

export type Card = z.infer<typeof Card>
