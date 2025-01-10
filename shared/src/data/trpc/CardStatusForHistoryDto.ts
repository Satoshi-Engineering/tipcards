import z from 'zod'

import { CardStatusDto } from './CardStatusDto.js'

export const CardStatusForHistoryDto = CardStatusDto.extend({
  setId: z.string().nullable(), // in case of a pending set funding the frontend wants to create a link to the (set) invoice
  setName: z.string().nullable(),

  created: z.date().default(() => new Date()),
  funded: z.date().nullable().default(null),
  withdrawn: z.date().nullable().default(null),

  noteForStatusPage: z.string().nullable(),
  textForWithdraw: z.string().nullable(),
  landingPageViewed: z.date().nullable(),
  bulkWithdrawCreated: z.date().nullable(),
})

export type CardStatusForHistoryDto = z.infer<typeof CardStatusForHistoryDto>
