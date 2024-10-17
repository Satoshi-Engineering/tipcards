import z from 'zod'

export const Settings = z.object({
  numberOfCards: z.number(),
  cardHeadline: z.string(),
  cardCopytext: z.string(),
  cardsQrCodeLogo: z.string().nullable().transform((v) => v === '' ? null : v),
  setName: z.string().default(''),
  landingPage: z.string().nullable().default(null).describe('id of the landingpage'),
})

export type Settings = z.infer<typeof Settings>

export const Set = z.object({
  id: z.string(),
  settings: Settings.nullable().default(null),
  created: z.number().default(() => + new Date() / 1000).describe('unix timestamp'),
  date: z.number().nullable().default(null).describe('unix timestamp of latest update'),

  userId: z.string().nullable().default(null),

  text: z.string().default('').describe('this text is used if cards are funded via set-funding'),
  note: z.string().default('').describe('this note is used if cards are funded via set-funding'),
  invoice: z.object({
    fundedCards: z.number().array().describe('list of card indices (e.g. [0, 1, 2, 5, 7])'),
    amount: z.number().describe('total amount'),
    payment_hash: z.string(),
    payment_request: z.string(),
    created: z.number().describe('unix timestamp'),
    paid: z.number().nullable().default(null).describe('unix timestamp'),
    expired: z.boolean().default(false),
  }).nullable().default(null),
})

export type Set = z.infer<typeof Set>
