import { describe, expect, it } from 'vitest'

import '../mocks/database/client.js'
import { addCard } from '../mocks/domain/CardStatus.js'

import CardsSummary from '@backend/domain/CardsSummary.js'
import CardStatus from '@backend/domain/CardStatus.js'
import { createCard } from '../../drizzleData.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { Card } from '@backend/database/schema/Card.js'

describe('CardsSummary', () => {
  it('should create a CardsSummary from an array of CardStatuses', async () => {
    const cards = createCards(8)
    addCard(cards[0], CardStatusEnum.enum.unfunded, 0)
    addCard(cards[1], CardStatusEnum.enum.bulkWithdrawPending, 100)
    addCard(cards[2], CardStatusEnum.enum.funded, 210)
    addCard(cards[3], CardStatusEnum.enum.withdrawn, 100)
    addCard(cards[4], CardStatusEnum.enum.recentlyWithdrawn, 100)
    addCard(cards[5], CardStatusEnum.enum.invoiceFunding, 100)
    addCard(cards[6], CardStatusEnum.enum.funded, 210)
    addCard(cards[7], CardStatusEnum.enum.unfunded, 0)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.fromCardStatuses(cardStatuses)

    expect(cardsSummary.getSummary()).toEqual({
      withdrawn: { count: 2, amount: 200 },
      funded: { count: 2, amount: 420 },
      pending: { count: 2, amount: 200 },
      unfunded: { count: 2, amount: 0 },
    })
  })

  it('should count all pending statuses together as pending', async () => {
    const cards = createCards(12)
    addCard(cards[0], CardStatusEnum.enum.invoiceFunding, 100)
    addCard(cards[1], CardStatusEnum.enum.lnurlpFunding, 100)
    addCard(cards[2], CardStatusEnum.enum.lnurlpSharedFunding, 100)
    addCard(cards[3], CardStatusEnum.enum.setInvoiceFunding, 100)
    addCard(cards[4], CardStatusEnum.enum.invoiceExpired, 100)
    addCard(cards[5], CardStatusEnum.enum.lnurlpExpired, 100)
    addCard(cards[6], CardStatusEnum.enum.lnurlpSharedExpiredEmpty, 100)
    addCard(cards[7], CardStatusEnum.enum.lnurlpSharedExpiredFunded, 100)
    addCard(cards[8], CardStatusEnum.enum.setInvoiceExpired, 100)
    addCard(cards[9], CardStatusEnum.enum.withdrawPending, 100)
    addCard(cards[10], CardStatusEnum.enum.bulkWithdrawPending, 100)
    addCard(cards[11], CardStatusEnum.enum.isLockedByBulkWithdraw, 100)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.fromCardStatuses(cardStatuses)

    expect(cardsSummary.getSummary()).toEqual({
      withdrawn: { count: 0, amount: 0 },
      funded: { count: 0, amount: 0 },
      pending: { count: 12, amount: 1200 },
      unfunded: { count: 0, amount: 0 },
    })
  })

  it('should count all withdrawn statuses together as withdrawn', async () => {
    const cards = createCards(3)
    addCard(cards[0], CardStatusEnum.enum.withdrawn, 100)
    addCard(cards[1], CardStatusEnum.enum.recentlyWithdrawn, 100)
    addCard(cards[2], CardStatusEnum.enum.withdrawnByBulkWithdraw, 100)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.fromCardStatuses(cardStatuses)

    expect(cardsSummary.getSummary()).toEqual({
      withdrawn: { count: 3, amount: 300 },
      funded: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      unfunded: { count: 0, amount: 0 },
    })
  })
})

const createCards = (count: number) => Array.from({ length: count }, () => createCard())

const getCardStatusesForCards = async (cards: Card[]) => await Promise.all(cards.map(
  (card) => CardStatus.latestFromCardHashOrDefault(card.hash)),
)
