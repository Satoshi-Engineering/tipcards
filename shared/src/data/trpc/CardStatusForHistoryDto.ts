import z from 'zod'

import { CardStatusDto } from './CardStatusDto.js'

export const CardStatusForHistoryDto = CardStatusDto.extend({
  landingPageViewed: z.date().nullable(),
  bulkWithdrawCreated: z.date().nullable(),
  setId: z.string().nullable(), // in case of a pending set funding the frontend wants to create a link to the (set) invoice
  setName: z.string().nullable(),
  noteForStatusPage: z.string().nullable(),
  textForWithdraw: z.string().nullable(),
})

export type CardStatusForHistoryDto = z.infer<typeof CardStatusForHistoryDto>
