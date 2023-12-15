import { z } from 'zod'

// Source: LNURL Specifications at https://github.com/lnurl/luds/blob/luds/03.md
export const LNURLWithdrawRequest = z.object({
  tag: z.literal('withdrawRequest').describe('type of LNURL'),
  callback: z.string().describe('The URL which LN SERVICE would accept a withdrawal Lightning invoice as query parameter'),
  k1: z.string().describe('Random or non-random string to identify the user\'s LN WALLET when using the callback URL'),
  defaultDescription: z.string().describe('A default withdrawal invoice description'),
  minWithdrawable: z.number().default(0).describe('Min amount (in millisatoshis) the user can withdraw from LN SERVICE, or 0'),
  maxWithdrawable: z.number().describe('Max amount (in millisatoshis) the user can withdraw from LN SERVICE, or equal to minWithdrawable if the user has no choice over the amounts'),
}).refine(schema => schema.maxWithdrawable >= schema.minWithdrawable, {
  message: 'maxWithdrawable has to be larger or equal to minWithdrawable',
})

export type LNURLWithdrawRequest = z.infer<typeof LNURLWithdrawRequest>
