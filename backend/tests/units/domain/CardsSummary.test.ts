import { describe, expect, it } from 'vitest'

import '../mocks/database/client.js'
import { addCard } from '../mocks/domain/CardStatus.js'

import CardsSummary from '@backend/domain/CardsSummary.js'
import CardStatus from '@backend/domain/CardStatus.js'
import { createCard } from '../../drizzleData.js'
import { CardStatusEnum } from '@shared/data/trpc/CardStatusDto.js'
import { Card } from '@backend/database/schema/Card.js'
import { CardsSummaryCategoriesEnum } from '@shared/data/trpc/CardsSummaryDto.js'

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
    const cardsSummary = CardsSummary.toTRpcResponse(cardStatuses)

    expect(cardsSummary).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 1, amount: 100 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: 2, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 3, amount: 520 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 2, amount: 200 },
    })
  })

  it('should count all pending statuses together as pending', async () => {
    const cards = createCards(10)
    addCard(cards[0], CardStatusEnum.enum.invoiceFunding, 100)
    addCard(cards[1], CardStatusEnum.enum.lnurlpFunding, 100)
    addCard(cards[2], CardStatusEnum.enum.lnurlpSharedFunding, 100)
    addCard(cards[3], CardStatusEnum.enum.setInvoiceFunding, 100)
    addCard(cards[4], CardStatusEnum.enum.invoiceExpired, 100)
    addCard(cards[5], CardStatusEnum.enum.lnurlpExpired, 100)
    addCard(cards[6], CardStatusEnum.enum.lnurlpSharedExpiredEmpty, 100)
    addCard(cards[7], CardStatusEnum.enum.lnurlpSharedExpiredFunded, 100)
    addCard(cards[8], CardStatusEnum.enum.setInvoiceExpired, 100)
    addCard(cards[9], CardStatusEnum.enum.isLockedByBulkWithdraw, 100)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.toTRpcResponse(cardStatuses)

    expect(cardsSummary).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 10, amount: 1000 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 0, amount: 0 },
    })
  })

  it('should count all withdrawn statuses together as withdrawn', async () => {
    const cards = createCards(3)
    addCard(cards[0], CardStatusEnum.enum.withdrawn, 100)
    addCard(cards[1], CardStatusEnum.enum.recentlyWithdrawn, 100)
    addCard(cards[2], CardStatusEnum.enum.withdrawnByBulkWithdraw, 100)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.toTRpcResponse(cardStatuses)

    expect(cardsSummary).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 3, amount: 300 },
    })
  })

  it('should count all funded statuses together as funded', async () => {
    const cards = createCards(3)
    addCard(cards[0], CardStatusEnum.enum.withdrawPending, 100)
    addCard(cards[1], CardStatusEnum.enum.bulkWithdrawPending, 100)
    addCard(cards[2], CardStatusEnum.enum.funded, 100)

    const cardStatuses = await getCardStatusesForCards(cards)
    const cardsSummary = CardsSummary.toTRpcResponse(cardStatuses)

    expect(cardsSummary).toEqual({
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.unfunded]: { count: 0, amount: 0 },
      [CardsSummaryCategoriesEnum.enum.funded]: { count: 3, amount: 300 },
      [CardsSummaryCategoriesEnum.enum.withdrawn]: { count: 0, amount: 0 },
    })
  })
})

const createCards = (count: number) => Array.from({ length: count }, () => createCard())

const getCardStatusesForCards = async (cards: Card[]) => await Promise.all(cards.map(
  (card) => CardStatus.latestFromCardHashOrDefault(card.hash)),
)
