import z from 'zod'

export const Card = z.object({
  cardHash: z.string(), // created via sha256(`${cardSetUuid}/${cardSetIndex}`)
  text: z.string().optional(), // shown in lightning app when withdrawing
  note: z.string().optional(), // shown on status page of card (info for person who funded the card)
  invoice: z.object({
    amount: z.number(),
    payment_hash: z.string(),
    payment_request: z.string(),
    created: z.number(), // unix timestamp
    paid: z.number().nullable(), // unix timestamp
  }).nullable(),
  lnurlp: z.object({
    shared: z.boolean().optional(),
    amount: z.number().nullable(),
    payment_hash: z.string().array().nullable(),
    id: z.union([z.number(), z.string()]),
    created: z.number(), // unix timestamp
    paid: z.number().nullable(), // unix timestamp
  }).nullable(), // gets created if the user scans an unfunded card with a wallet
  setFunding: z.object({
    amount: z.number(),
    created: z.number(), // unix timestamp
    paid: z.number().nullable(), // unix timestamp
  }).optional(), // card is funded via set-funding
  lnbitsWithdrawId: z.string().nullable(), // gets set as soon as the card is funded
  landingPageViewed: z.number().optional(), // store the first time the landing page was viewed after it has been funded
  used: z.number().nullable(), // unix timestamp
})

export type Card = z.infer<typeof Card>
