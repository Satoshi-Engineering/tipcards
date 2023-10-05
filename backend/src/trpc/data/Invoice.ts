import z from 'zod'

export const Invoice = z.object({
  amount: z.number(),
  payment_hash: z.string(),
  payment_request: z.string(),
  created: z.date().default(() => new Date()),
  paid: z.date().optional(),
  expiresAt: z.date(),
  textForWithdraw: z.string(),
  noteForStatusPage: z.string(),
})
