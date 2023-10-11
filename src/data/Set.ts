import z from 'zod'

export const Settings = z.object({
  numberOfCards: z.number(),
  cardHeadline: z.string(),
  cardCopytext: z.string(),
  cardsQrCodeLogo: z.string(),
  setName: z.string().optional(),
  landingPage: z.string().optional(), // id of the landingpage
})

export type Settings = z.infer<typeof Settings>

export const Set = z.object({
  id: z.string(),
  settings: Settings.optional().nullable(),
  created: z.number().optional(), // unix timestamp
  date: z.number().optional(), // unix timestamp of latest update

  userId: z.string().optional().nullable(),

  text: z.string().optional(), // this text is used if cards are funded via set-funding
  note: z.string().optional(), // this note is used if cards are funded via set-funding
  invoice: z.object({
    fundedCards: z.number().array(), // list of card indices (e.g. [0, 1, 2, 5, 7])
    amount: z.number(), // total amount
    payment_hash: z.string(),
    payment_request: z.string(),
    created: z.number(), // unix timestamp
    paid: z.number().nullable(), // unix timestamp
    expired: z.boolean().optional(),
  }).optional().nullable(),
})

export type Set = z.infer<typeof Set>
