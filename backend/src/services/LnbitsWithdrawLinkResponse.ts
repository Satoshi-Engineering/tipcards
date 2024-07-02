import z from 'zod'

export const LnbitsWithdrawLinkResponse = z.object({
  id: z.string().describe('id'),
  open_time: z.number().describe('unix timestamp'),
  uses: z.number().describe('how often can this link be used to withdraw funds, should always be 1'),
  used: z.number().describe('how often has this link been used to withdraw funds, should only be 0 or 1'),
})

export type LnbitsWithdrawLinkResponse = z.infer<typeof LnbitsWithdrawLinkResponse>
