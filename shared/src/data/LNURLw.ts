import { z } from 'zod'

export const LNURLw = z.object({
  tag: z.string().default(''),
  callback: z.string().default(''),
  k1: z.string().default(''),
  minWithdrawable: z.number().default(0),
  maxWithdrawable: z.number().default(0),
  defaultDescription: z.string().default(''),
}).default({})

export type LNURLw = z.infer<typeof LNURLw>
