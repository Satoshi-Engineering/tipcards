import z from 'zod'

import { CardStatusDto } from './CardStatusDto.js'

export const CardStatusForHistoryDto = CardStatusDto.extend({
  landingPageViewed: z.date().nullable(),
  bulkWithdrawCreated: z.date().nullable(),
  setName: z.string().nullable(),
})

export type CardStatusForHistoryDto = z.infer<typeof CardStatusForHistoryDto>
