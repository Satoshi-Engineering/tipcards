import { CardStatusEnum, userActionRequired, fundedStatuses, unfundedStatuses, withdrawnStatuses } from '@shared/data/trpc/CardStatusDto.js'
import { CardsSummaryCategoriesEnum, CardsSummaryDto } from '@shared/data/trpc/CardsSummaryDto.js'

import CardStatus from './CardStatus.js'

export default class CardsSummary {
  public static fromCardStatuses(cardStatuses: CardStatus[]): CardsSummary {
    return new CardsSummary(cardStatuses)
  }

  public toTRpcResponse(): CardsSummaryDto {
    return {
      [CardsSummaryCategoriesEnum.enum.userActionRequired]: this.userActionRequired,
      [CardsSummaryCategoriesEnum.enum.unfunded]: this.unfunded,
      [CardsSummaryCategoriesEnum.enum.funded]: this.funded,
      [CardsSummaryCategoriesEnum.enum.withdrawn]: this.withdrawn,
    }
  }

  public get userActionRequired(): { count: number, amount: number } {
    return this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.userActionRequired)
  }

  public get unfunded(): { count: number, amount: number } {
    return this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.unfunded)
  }

  public get funded(): { count: number, amount: number } {
    return this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.funded)
  }

  public get withdrawn(): { count: number, amount: number } {
    return this.getCountAndAmountByStatusCategory(CardsSummaryCategoriesEnum.enum.withdrawn)
  }

  private cardStatuses: CardStatus[]

  private constructor(cardStatuses: CardStatus[]) {
    this.cardStatuses = cardStatuses
  }

  private getCountAndAmountByStatusCategory(statusCategory: CardsSummaryCategoriesEnum): { count: number, amount: number } {
    const filteredCardStatuses = this.cardStatuses.filter(
      ({ status }) => CardsSummary.getStatusCategoryForCardStatus(status) === statusCategory,
    )
    const count = filteredCardStatuses.length
    const amount = filteredCardStatuses.reduce((sum, { amount }) => sum + (amount ?? 0), 0)
    return { count, amount }
  }

  private static getStatusCategoryForCardStatus(status: CardStatusEnum): CardsSummaryCategoriesEnum {
    // this status is greedy and includes all statuses that require user action,
    // even if the cardStatus would be in another category as well
    if (userActionRequired.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.userActionRequired
    }

    if (unfundedStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.unfunded
    }
    if (fundedStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.funded
    }
    if (withdrawnStatuses.includes(status)) {
      return CardsSummaryCategoriesEnum.enum.withdrawn
    }

    throw new Error(`Unknown status: ${status}`)
  }
}
