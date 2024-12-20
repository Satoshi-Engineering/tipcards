import { describe, it, expect } from 'vitest'

import '../mocks/process.env.js'
import {
  createSet, createSetSettings,
  createCardVersion,
  createInvoice,
  createLnurlW,
  createCardForSet,
} from '../../drizzleData.js'

import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { OpenTaskType } from '@shared/data/trpc/OpenTaskDto.js'
import { SetSettingsDto } from '@shared/data/trpc/SetSettingsDto.js'

import { OpenBulkwithdrawTask } from '@backend/domain/OpenBulkWithdrawTask.js'
import CardVersionWithInvoices from '@backend/database/data/CardVersionWithInvoices.js'
import InvoiceWithSetFundingInfo from '@backend/database/data/InvoiceWithSetFundingInfo.js'

describe('OpenBulkWithdrawTask', () => {
  it('should build the correct OpenSetTaskDto', async () => {
    const set = createSet()
    const setSettings = createSetSettings(set)
    const card1 = createCardForSet(set, 0)
    const cardVersion1 = createCardVersion(card1)
    const card2 = createCardForSet(set, 1)
    const cardVersion2 = createCardVersion(card2)
    const { invoice } = createInvoice(420, cardVersion1, cardVersion2)
    invoice.paid = invoice.created
    const cards = [
      new CardVersionWithInvoices(
        cardVersion1,
        [new InvoiceWithSetFundingInfo(invoice, 2)],
      ),
      new CardVersionWithInvoices(
        cardVersion2,
        [new InvoiceWithSetFundingInfo(invoice, 2)],
      ),
    ]
    const lnurlW = createLnurlW(cardVersion1, cardVersion2)

    const openTask = OpenBulkwithdrawTask.fromData({
      set,
      setSettings,
      cards,
      lnurlW,
    })

    expect(openTask.created).toEqual(lnurlW.created)
    expect(openTask.sats).toEqual(420)
    expect(openTask.toTrpcResponse()).toEqual({
      type: OpenTaskType.enum.setAction,
      created: lnurlW.created,
      sats: 420,
      cardStatus: CardStatusEnum.enum.isLockedByBulkWithdraw,
      setId: set.id,
      setSettings: SetSettingsDto.parse(setSettings),
      cardCount: 2,
    })
  })
})
