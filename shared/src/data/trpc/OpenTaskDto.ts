import { z } from 'zod'

import { CardStatusEnum } from './CardStatusDto.js'
import { SetSettingsDto } from './SetSettingsDto.js'

export const OpenTaskType = z.enum(['cardAction', 'setAction'])

const OpenTaskBase = z.object({
  type: OpenTaskType,
  created: z.date(),
  sats: z.number(),
})

export const OpenCardTaskDto = OpenTaskBase.extend({
  type: z.literal(OpenTaskType.enum.cardAction),
  cardStatus: z.enum([
    CardStatusEnum.enum.invoiceFunding,
    CardStatusEnum.enum.lnurlpFunding,
    CardStatusEnum.enum.lnurlpSharedFunding,
    CardStatusEnum.enum.invoiceExpired,
    CardStatusEnum.enum.lnurlpExpired,
    CardStatusEnum.enum.lnurlpSharedExpiredEmpty,
    CardStatusEnum.enum.lnurlpSharedExpiredFunded,
  ]),
  cardHash: z.string(),
  noteForStatusPage: z.string().nullable(),
  textForWithdraw: z.string().nullable(),
})
export type OpenCardTaskDto = z.infer<typeof OpenCardTaskDto>

export const OpenSetTaskDto = OpenTaskBase.extend({
  type: z.literal(OpenTaskType.enum.setAction),
  cardStatus: z.enum([
    CardStatusEnum.enum.setInvoiceFunding,
    CardStatusEnum.enum.setInvoiceExpired,
    CardStatusEnum.enum.isLockedByBulkWithdraw,
  ]),
  setId: z.string(),
  setSettings: SetSettingsDto,
  cardCount: z.number(),
})
export type OpenSetTaskDto = z.infer<typeof OpenSetTaskDto>

export const OpenTaskDto = z.union([OpenCardTaskDto, OpenSetTaskDto])
export type OpenTaskDto = z.infer<typeof OpenTaskDto>
