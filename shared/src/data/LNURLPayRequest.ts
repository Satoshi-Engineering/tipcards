import { z } from 'zod'

// Source: LNURL Specifications at https://github.com/lnurl/luds/blob/luds/06.md
export const LNURLPayRequest = z.object({
  tag: z.literal('payRequest').describe('type of LNURL'),
  callback: z.string().describe('The URL from LN SERVICE which will accept the pay request parameters'),
  maxSendable: z.number().describe('Max millisatoshi amount LN SERVICE is willing to receive'),
  minSendable: z.number().describe('Min millisatoshi amount LN SERVICE is willing to receive, can not be less than 1 or more than `maxSendable`'),
  metadata: z.string().describe('Metadata json which must be presented as raw string here, this is required to pass signature verification at a later step'),
}).refine(
  (schema) => schema.minSendable >= 1 && schema.maxSendable >= schema.minSendable,
  { message: 'maxSendable has to be larger or equal than minSendable' },
)

export type LNURLPayRequest = z.infer<typeof LNURLPayRequest>
